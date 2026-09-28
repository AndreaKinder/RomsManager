import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  IconBrandAndroid,
  IconUsb,
  IconRefresh,
  IconCheck,
  IconUpload,
  IconDownload,
  IconX,
  IconFolder,
  IconAlertCircle,
  IconDeviceGamepad2,
  IconDeviceFloppy,
  IconSearch,
} from "@tabler/icons-react";

export default function AndroidSyncModal({ onClose, onSyncComplete, initialSingleRom = null }) {
  // ADB & Device state
  const [adbStatus, setAdbStatus] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedSerial, setSelectedSerial] = useState("");
  const [isCheckingDevices, setIsCheckingDevices] = useState(false);
  const [isDownloadingAdb, setIsDownloadingAdb] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Storage state
  const [storageLocations, setStorageLocations] = useState([]);
  const [selectedStoragePath, setSelectedStoragePath] = useState("/sdcard/ROMs");
  const [customPath, setCustomPath] = useState("");
  const [useCustomPath, setUseCustomPath] = useState(false);

  // Sync data state
  const [activeTab, setActiveTab] = useState("export"); // "export" | "import"
  const [isComparing, setIsComparing] = useState(false);
  const [syncDiff, setSyncDiff] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedConsoleFilter, setSelectedConsoleFilter] = useState("all");

  // Selection state
  const [selectedRomsToExport, setSelectedRomsToExport] = useState(new Set());
  const [selectedRomsToImport, setSelectedRomsToImport] = useState(new Set());
  const [syncSaves, setSyncSaves] = useState(true);
  const [syncCovers, setSyncCovers] = useState(false);

  // Progress state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const effectiveRemotePath = useCustomPath && customPath.trim()
    ? customPath.trim()
    : selectedStoragePath;

  // 1. Check ADB status and connected USB devices
  const refreshDevices = useCallback(async () => {
    setIsCheckingDevices(true);
    setErrorMessage(null);

    try {
      const statusRes = await window.electronAPI.adbGetStatus();
      setAdbStatus(statusRes);

      if (statusRes.installed) {
        const devRes = await window.electronAPI.adbListDevices();
        const detectedDevices = devRes.devices || [];
        setDevices(detectedDevices);

        if (detectedDevices.length > 0) {
          // If previous selection is still there, keep it; otherwise pick first authorized USB device
          setSelectedSerial((prev) => {
            const exists = detectedDevices.some((d) => d.serial === prev);
            if (exists) return prev;
            const usbDevice = detectedDevices.find((d) => !d.isWireless && d.state === "device");
            return usbDevice ? usbDevice.serial : detectedDevices[0].serial;
          });
        } else {
          setSelectedSerial("");
        }
      }
    } catch (err) {
      console.error("Error checking ADB devices:", err);
      setErrorMessage("Error al buscar dispositivos: " + err.message);
    } finally {
      setIsCheckingDevices(false);
    }
  }, []);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  // Listen to download progress
  useEffect(() => {
    const unsub = window.electronAPI.onAdbDownloadProgress?.((prog) => {
      if (prog && typeof prog.percent === "number") {
        setDownloadProgress(prog.percent);
      }
    });
    return () => {
      if (unsub) unsub();
      if (window.electronAPI.removeAdbDownloadProgress) {
        window.electronAPI.removeAdbDownloadProgress();
      }
    };
  }, []);

  // Listen to sync progress
  useEffect(() => {
    const unsub = window.electronAPI.onAdbSyncProgress?.((prog) => {
      setSyncProgress(prog);
    });
    return () => {
      if (unsub) unsub();
      if (window.electronAPI.removeAdbSyncProgress) {
        window.electronAPI.removeAdbSyncProgress();
      }
    };
  }, []);

  // 2. When selected device changes, detect storage locations
  useEffect(() => {
    if (!selectedSerial) {
      setStorageLocations([]);
      return;
    }

    const currentDevice = devices.find((d) => d.serial === selectedSerial);
    if (!currentDevice || currentDevice.state !== "device") {
      return;
    }

    (async () => {
      try {
        const res = await window.electronAPI.adbGetStoragePaths(selectedSerial);
        if (res.success && res.locations && res.locations.length > 0) {
          setStorageLocations(res.locations);
          const def = res.locations.find((l) => l.isDefault) || res.locations[0];
          setSelectedStoragePath(def.path);
        }
      } catch (err) {
        console.warn("Could not query storage paths:", err);
      }
    })();
  }, [selectedSerial, devices]);

  // 3. Compare ROMs when device and remote path are ready
  const loadComparison = useCallback(async () => {
    if (!selectedSerial || !effectiveRemotePath) return;

    const currentDevice = devices.find((d) => d.serial === selectedSerial);
    if (!currentDevice || currentDevice.state !== "device") return;

    setIsComparing(true);
    setErrorMessage(null);
    setSyncResult(null);

    try {
      const res = await window.electronAPI.adbCompareRoms(
        selectedSerial,
        effectiveRemotePath,
      );

      if (res.success) {
        setSyncDiff(res);

        // Pre-select new ROMs by default for convenience
        const newKeys = new Set(
          res.toExport.map((r) => `${r.consoleId}:${r.romName}`),
        );

        // If opening modal for a specific ROM, ensure only that one is checked
        if (initialSingleRom) {
          setSelectedRomsToExport(
            new Set([`${initialSingleRom.system}:${initialSingleRom.romName}`]),
          );
        } else {
          setSelectedRomsToExport(newKeys);
        }

        // Pre-select all to-import ROMs
        setSelectedRomsToImport(
          new Set(res.toImport.map((r) => `${r.consoleId}:${r.romName}`)),
        );
      } else {
        setErrorMessage(res.error || "No se pudo escanear la consola");
      }
    } catch (err) {
      console.error("Error comparing ROMs:", err);
      setErrorMessage(err.message);
    } finally {
      setIsComparing(false);
    }
  }, [selectedSerial, effectiveRemotePath, devices, initialSingleRom]);

  useEffect(() => {
    if (selectedSerial && effectiveRemotePath) {
      loadComparison();
    }
  }, [selectedSerial, effectiveRemotePath, loadComparison]);

  // Auto-download ADB platform-tools
  const handleDownloadAdb = async () => {
    setIsDownloadingAdb(true);
    setDownloadProgress(0);
    setErrorMessage(null);
    try {
      const res = await window.electronAPI.adbDownloadInstall();
      if (res.success) {
        await refreshDevices();
      } else {
        setErrorMessage("Error al instalar ADB: " + res.error);
      }
    } catch (err) {
      setErrorMessage("Error al descargar ADB: " + err.message);
    } finally {
      setIsDownloadingAdb(false);
    }
  };

  const handleSelectAdbBinary = async () => {
    try {
      const res = await window.electronAPI.adbSelectBinary();
      if (!res.canceled && res.success) {
        await refreshDevices();
      }
    } catch (err) {
      setErrorMessage("Error al seleccionar ADB: " + err.message);
    }
  };

  // Filtered lists
  const availableConsoles = useMemo(() => {
    if (!syncDiff || !syncDiff.pcConsoles) return [];
    return syncDiff.pcConsoles.map((c) => ({
      id: c.consoleId,
      name: c.consoleName,
      count: c.romCount,
    }));
  }, [syncDiff]);

  const filteredExportRoms = useMemo(() => {
    if (!syncDiff || !syncDiff.pcConsoles) return [];
    let list = [];
    for (const c of syncDiff.pcConsoles) {
      if (selectedConsoleFilter === "all" || selectedConsoleFilter === c.consoleId) {
        list.push(...c.roms);
      }
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.romName.toLowerCase().includes(q),
      );
    }

    return list;
  }, [syncDiff, selectedConsoleFilter, searchFilter]);

  const filteredImportRoms = useMemo(() => {
    if (!syncDiff || !syncDiff.toImport) return [];
    let list = syncDiff.toImport;

    if (selectedConsoleFilter !== "all") {
      list = list.filter((r) => r.consoleId === selectedConsoleFilter);
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      list = list.filter((r) => r.romName.toLowerCase().includes(q));
    }

    return list;
  }, [syncDiff, selectedConsoleFilter, searchFilter]);

  // Checkbox helpers
  const toggleSelectExportRom = (consoleId, romName) => {
    const key = `${consoleId}:${romName}`;
    const next = new Set(selectedRomsToExport);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedRomsToExport(next);
  };

  const handleSelectAllExport = (selectAll) => {
    if (selectAll) {
      const allKeys = new Set(
        filteredExportRoms.map((r) => `${r.consoleId}:${r.romName}`),
      );
      setSelectedRomsToExport(allKeys);
    } else {
      setSelectedRomsToExport(new Set());
    }
  };

  const handleSelectOnlyNewExport = () => {
    if (!syncDiff) return;
    const newKeys = new Set(
      syncDiff.toExport.map((r) => `${r.consoleId}:${r.romName}`),
    );
    setSelectedRomsToExport(newKeys);
  };

  const toggleSelectImportRom = (consoleId, romName) => {
    const key = `${consoleId}:${romName}`;
    const next = new Set(selectedRomsToImport);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedRomsToImport(next);
  };

  const handleSelectAllImport = (selectAll) => {
    if (selectAll) {
      const allKeys = new Set(
        filteredImportRoms.map((r) => `${r.consoleId}:${r.romName}`),
      );
      setSelectedRomsToImport(allKeys);
    } else {
      setSelectedRomsToImport(new Set());
    }
  };

  // Run Export to Android (PC -> Console)
  const handleStartExport = async () => {
    if (isSyncing || selectedRomsToExport.size === 0) return;

    const itemsToExport = [];
    if (syncDiff && syncDiff.pcConsoles) {
      for (const c of syncDiff.pcConsoles) {
        for (const rom of c.roms) {
          const key = `${rom.consoleId}:${rom.romName}`;
          if (selectedRomsToExport.has(key)) {
            itemsToExport.push({
              consoleId: rom.consoleId,
              romName: rom.romName,
              localPath: rom.localPath,
              savePath: rom.savePath,
              coverPath: rom.coverPath,
            });
          }
        }
      }
    }

    if (itemsToExport.length === 0) return;

    setIsSyncing(true);
    setSyncResult(null);
    setErrorMessage(null);

    try {
      const res = await window.electronAPI.adbExportRoms(
        selectedSerial,
        effectiveRemotePath,
        itemsToExport,
        { syncSaves, syncCovers },
      );

      setSyncResult({
        type: "export",
        count: res.count,
        success: res.success,
        errors: res.errors || [],
      });

      // Reload comparison to reflect updated state
      await loadComparison();
      if (onSyncComplete) onSyncComplete();
    } catch (err) {
      setErrorMessage("Error durante la sincronización: " + err.message);
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  // Run Import to PC (Console -> PC)
  const handleStartImport = async () => {
    if (isSyncing || selectedRomsToImport.size === 0) return;

    const itemsToImport = [];
    if (syncDiff && syncDiff.toImport) {
      for (const r of syncDiff.toImport) {
        const key = `${r.consoleId}:${r.romName}`;
        if (selectedRomsToImport.has(key)) {
          itemsToImport.push(r);
        }
      }
    }

    if (itemsToImport.length === 0) return;

    setIsSyncing(true);
    setSyncResult(null);
    setErrorMessage(null);

    try {
      const res = await window.electronAPI.adbImportRoms(
        selectedSerial,
        itemsToImport,
      );

      setSyncResult({
        type: "import",
        count: res.count,
        success: res.success,
        errors: res.errors || [],
      });

      // Reload comparison to reflect updated state
      await loadComparison();
      if (onSyncComplete) onSyncComplete();
    } catch (err) {
      setErrorMessage("Error durante la importación: " + err.message);
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  const currentDevice = devices.find((d) => d.serial === selectedSerial);

  return (
    <div className="modal-backdrop" onClick={isSyncing ? undefined : onClose}>
      <div
        className="modal-content android-sync-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 860, width: "95%" }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--success-color)",
              }}
            >
              <IconBrandAndroid size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
                Sincronización con Consola Android (USB)
              </h2>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  margin: 0,
                }}
              >
                Transfiere y sincroniza juegos directamente por cable ADB
              </p>
            </div>
          </div>
          {!isSyncing && (
            <button className="modal-close-btn" onClick={onClose}>
              <IconX size={20} />
            </button>
          )}
        </div>

        <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
          {/* Missing ADB Alert */}
          {adbStatus && !adbStatus.installed && (
            <div className="android-alert-box warning" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <IconAlertCircle size={28} color="var(--warning-color)" />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 6px 0", color: "var(--warning-color)" }}>
                    Herramienta ADB no encontrada
                  </h4>
                  <p style={{ margin: "0 0 12px 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Para comunicarse con tu consola por cable USB se requiere el comando <code>adb</code> de Android.
                    Puedes descargarlo e instalarlo automáticamente con un solo clic.
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleDownloadAdb}
                      disabled={isDownloadingAdb}
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <IconDownload size={16} />
                      {isDownloadingAdb
                        ? `Descargando ADB (${downloadProgress}%)...`
                        : "Instalar ADB automáticamente"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleSelectAdbBinary}
                      disabled={isDownloadingAdb}
                    >
                      Seleccionar binario adb...
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USB Device Selection / Status Bar */}
          <div className="android-device-bar" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <IconUsb size={22} color="var(--primary-color)" />
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block" }}>
                    Consola conectada por cable USB
                  </span>
                  {devices.length > 0 ? (
                    <select
                      value={selectedSerial}
                      onChange={(e) => setSelectedSerial(e.target.value)}
                      disabled={isSyncing}
                      style={{
                        background: "var(--surface)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-color)",
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {devices.map((d) => (
                        <option key={d.serial} value={d.serial}>
                          {d.displayName || d.model} {d.state !== "device" ? `(${d.state})` : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <strong style={{ color: "var(--text-secondary)" }}>
                      {isCheckingDevices ? "Buscando consola..." : "Ninguna consola detectada"}
                    </strong>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {currentDevice && (
                  <span
                    className={`sync-feedback-badge ${currentDevice.state === "device" ? "active" : ""}`}
                    style={{
                      background: currentDevice.state === "device" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                      color: currentDevice.state === "device" ? "var(--success-color)" : "var(--warning-color)",
                      padding: "4px 10px",
                      borderRadius: 12,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {currentDevice.state === "device" ? "Conectada y lista" : "Requiere autorización en pantalla"}
                  </span>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-icon"
                  onClick={refreshDevices}
                  disabled={isCheckingDevices || isSyncing}
                  title="Actualizar y buscar dispositivos"
                  style={{ padding: 6 }}
                >
                  <IconRefresh size={16} className={isCheckingDevices ? "spin" : ""} />
                </button>
              </div>
            </div>

            {/* Hint when no device or unauthorized */}
            {(!devices || devices.length === 0) && adbStatus?.installed && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: 8,
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: 4 }}>
                  ¿Cómo conectar tu consola Android por cable USB?
                </strong>
                <ol style={{ paddingLeft: 20, margin: 0 }}>
                  <li>Conecta la consola al PC usando un cable USB de datos.</li>
                  <li>
                    En la consola, activa la <strong>Depuración USB</strong> (en <em>Ajustes ➜ Opciones de desarrollador ➜ Depuración USB</em>).
                  </li>
                  <li>
                    En la pantalla de tu consola aparecerá un mensaje: <em>"¿Permitir depuración USB?"</em>. Marca <strong>"Permitir siempre"</strong> y pulsa Aceptar.
                  </li>
                  <li>Pulsa el botón de actualizar <IconRefresh size={14} style={{ verticalAlign: "middle" }} /> arriba.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Device Connected: Storage Selector & Sync Controls */}
          {currentDevice && currentDevice.state === "device" && (
            <>
              {/* Storage Destination */}
              <div
                style={{
                  background: "var(--surface)",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                  border: "1px solid var(--border-color)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                    <IconFolder size={16} color="var(--primary-color)" />
                    Carpeta de destino en la consola Android:
                  </label>
                  <button
                    type="button"
                    className="btn btn-text"
                    style={{ fontSize: "0.75rem", padding: "2px 6px" }}
                    onClick={() => setUseCustomPath(!useCustomPath)}
                  >
                    {useCustomPath ? "Usar detección automática" : "Escribir ruta manual"}
                  </button>
                </div>

                {!useCustomPath ? (
                  <select
                    value={selectedStoragePath}
                    onChange={(e) => setSelectedStoragePath(e.target.value)}
                    disabled={isSyncing}
                    style={{
                      width: "100%",
                      background: "var(--background)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-color)",
                      padding: "8px 10px",
                      borderRadius: 6,
                      fontSize: "0.85rem",
                    }}
                  >
                    {storageLocations.map((loc) => (
                      <option key={loc.id} value={loc.path}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    placeholder="/sdcard/ROMs o /storage/XXXX-XXXX/ROMs"
                    disabled={isSyncing}
                    style={{
                      width: "100%",
                      background: "var(--background)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-color)",
                      padding: "8px 10px",
                      borderRadius: 6,
                      fontSize: "0.85rem",
                    }}
                  />
                )}
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "6px 0 0 0" }}>
                  Las subcarpetas por consola (<code>snes</code>, <code>gba</code>, <code>psx</code>, <code>n64</code>...) se crearán automáticamente.
                </p>
              </div>

              {/* Sync Tabs: Export vs Import */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12, borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>
                <button
                  type="button"
                  className={`btn ${activeTab === "export" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTab("export")}
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}
                >
                  <IconUpload size={16} />
                  Enviar a la consola (PC ➔ Consola)
                  {syncDiff && (
                    <span
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        padding: "2px 6px",
                        borderRadius: 10,
                        fontSize: "0.75rem",
                      }}
                    >
                      {syncDiff.toExport.length} nuevos
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className={`btn ${activeTab === "import" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTab("import")}
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}
                >
                  <IconDownload size={16} />
                  Importar al PC (Consola ➔ PC)
                  {syncDiff && syncDiff.toImport.length > 0 && (
                    <span
                      style={{
                        background: "var(--warning-color)",
                        color: "#000",
                        padding: "2px 6px",
                        borderRadius: 10,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      {syncDiff.toImport.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Options & Filter Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 12,
                  flexWrap: "wrap",
                }}
              >
                {/* Search & Console filter */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 260 }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Filtrar juegos..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px 8px 6px 28px",
                        background: "var(--surface)",
                        border: "1px solid var(--border-color)",
                        borderRadius: 6,
                        color: "var(--text-primary)",
                        fontSize: "0.82rem",
                      }}
                    />
                    <IconSearch
                      size={14}
                      color="var(--text-secondary)"
                      style={{ position: "absolute", left: 8, top: 9 }}
                    />
                  </div>

                  <select
                    value={selectedConsoleFilter}
                    onChange={(e) => setSelectedConsoleFilter(e.target.value)}
                    style={{
                      background: "var(--surface)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-color)",
                      padding: "6px 8px",
                      borderRadius: 6,
                      fontSize: "0.82rem",
                    }}
                  >
                    <option value="all">Todas las consolas</option>
                    {availableConsoles.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Extra sync options (saves / covers) */}
                {activeTab === "export" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <label style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={syncSaves}
                        onChange={(e) => setSyncSaves(e.target.checked)}
                      />
                      <IconDeviceFloppy size={14} color="var(--success-color)" />
                      Partidas (.sav)
                    </label>
                    <label style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={syncCovers}
                        onChange={(e) => setSyncCovers(e.target.checked)}
                      />
                      Carátulas
                    </label>
                  </div>
                )}
              </div>

              {/* Selection action row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                }}
              >
                <div>
                  {activeTab === "export" ? (
                    <>
                      <span>{selectedRomsToExport.size} seleccionados para transferir</span>
                      <button
                        type="button"
                        className="btn btn-text"
                        style={{ fontSize: "0.78rem", marginLeft: 8 }}
                        onClick={() => handleSelectAllExport(selectedRomsToExport.size < filteredExportRoms.length)}
                      >
                        {selectedRomsToExport.size === filteredExportRoms.length
                          ? "Deseleccionar todos"
                          : "Seleccionar todos"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-text"
                        style={{ fontSize: "0.78rem", marginLeft: 6, color: "var(--primary-color)" }}
                        onClick={handleSelectOnlyNewExport}
                      >
                        Solo juegos nuevos
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{selectedRomsToImport.size} seleccionados para importar</span>
                      <button
                        type="button"
                        className="btn btn-text"
                        style={{ fontSize: "0.78rem", marginLeft: 8 }}
                        onClick={() => handleSelectAllImport(selectedRomsToImport.size < filteredImportRoms.length)}
                      >
                        {selectedRomsToImport.size === filteredImportRoms.length
                          ? "Deseleccionar todos"
                          : "Seleccionar todos"}
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-text"
                  onClick={loadComparison}
                  disabled={isComparing || isSyncing}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <IconRefresh size={13} className={isComparing ? "spin" : ""} />
                  Escanear consola
                </button>
              </div>

              {/* Games List */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 8,
                  maxHeight: 280,
                  overflowY: "auto",
                }}
              >
                {isComparing && (
                  <div style={{ padding: 20, textAlign: "center", color: "var(--text-secondary)" }}>
                    <IconRefresh size={20} className="spin" style={{ display: "block", margin: "0 auto 8px" }} />
                    Comparando juegos entre el PC y la consola Android...
                  </div>
                )}

                {/* TAB EXPORT (PC -> CONSOLE) */}
                {!isComparing && activeTab === "export" && (
                  filteredExportRoms.length === 0 ? (
                    <div style={{ padding: 20, textAlign: "center", color: "var(--text-secondary)" }}>
                      No se encontraron juegos para transferir con los filtros actuales.
                    </div>
                  ) : (
                    filteredExportRoms.map((rom) => {
                      const key = `${rom.consoleId}:${rom.romName}`;
                      const isSelected = selectedRomsToExport.has(key);
                      return (
                        <div
                          key={key}
                          onClick={() => toggleSelectExportRom(rom.consoleId, rom.romName)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 12px",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                            cursor: "pointer",
                            background: isSelected ? "rgba(99, 102, 241, 0.08)" : "transparent",
                            transition: "background 0.15s ease",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by container onClick
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {rom.title || rom.romName}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "flex", gap: 8, alignItems: "center" }}>
                              <span>{rom.romName}</span>
                              {rom.savePath && (
                                <span title="Partida guardada disponible" style={{ color: "var(--success-color)", display: "inline-flex", alignItems: "center", gap: 2 }}>
                                  <IconDeviceFloppy size={12} /> .sav
                                </span>
                              )}
                            </div>
                          </div>

                          <span
                            style={{
                              fontSize: "0.72rem",
                              padding: "2px 8px",
                              borderRadius: 4,
                              background: "rgba(255,255,255,0.06)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {rom.consoleName || rom.consoleId.toUpperCase()}
                          </span>

                          <span
                            style={{
                              fontSize: "0.72rem",
                              padding: "2px 8px",
                              borderRadius: 10,
                              fontWeight: 600,
                              background: rom.existsOnRemote ? "rgba(255,255,255,0.05)" : "rgba(16, 185, 129, 0.15)",
                              color: rom.existsOnRemote ? "var(--text-secondary)" : "var(--success-color)",
                            }}
                          >
                            {rom.existsOnRemote ? "En la consola" : "Nuevo"}
                          </span>
                        </div>
                      );
                    })
                  )
                )}

                {/* TAB IMPORT (CONSOLE -> PC) */}
                {!isComparing && activeTab === "import" && (
                  filteredImportRoms.length === 0 ? (
                    <div style={{ padding: 20, textAlign: "center", color: "var(--text-secondary)" }}>
                      {syncDiff && syncDiff.toImport.length === 0
                        ? "¡Tu PC ya tiene todos los juegos que están en la consola!"
                        : "No hay juegos para importar con los filtros actuales."}
                    </div>
                  ) : (
                    filteredImportRoms.map((rom) => {
                      const key = `${rom.consoleId}:${rom.romName}`;
                      const isSelected = selectedRomsToImport.has(key);
                      return (
                        <div
                          key={key}
                          onClick={() => toggleSelectImportRom(rom.consoleId, rom.romName)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 12px",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                            cursor: "pointer",
                            background: isSelected ? "rgba(99, 102, 241, 0.08)" : "transparent",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {rom.romName}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                              {rom.remotePath}
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              padding: "2px 8px",
                              borderRadius: 4,
                              background: "rgba(255,255,255,0.06)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {rom.consoleName || rom.consoleId.toUpperCase()}
                          </span>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              padding: "2px 8px",
                              borderRadius: 10,
                              fontWeight: 600,
                              background: "rgba(245, 158, 11, 0.15)",
                              color: "var(--warning-color)",
                            }}
                          >
                            No en PC
                          </span>
                        </div>
                      );
                    })
                  )
                )}
              </div>
            </>
          )}

          {/* Sync Progress Banner */}
          {isSyncing && syncProgress && (
            <div
              style={{
                marginTop: 16,
                padding: 14,
                background: "rgba(99, 102, 241, 0.1)",
                border: "1px solid var(--primary-color)",
                borderRadius: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 6 }}>
                <strong>
                  Transfiriendo por cable USB ({syncProgress.current} de {syncProgress.total}):
                </strong>
                <span style={{ fontWeight: 700, color: "var(--primary-color)" }}>
                  {syncProgress.percent}%
                </span>
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  marginBottom: 8,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {syncProgress.romName} ({syncProgress.consoleId?.toUpperCase()})
              </div>
              <div
                style={{
                  height: 8,
                  background: "var(--surface)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${syncProgress.percent}%`,
                    background: "var(--primary-color)",
                    transition: "width 0.2s ease",
                  }}
                />
              </div>
            </div>
          )}

          {/* Sync Result Banner */}
          {syncResult && (
            <div
              className={`android-alert-box ${syncResult.success ? "success" : "warning"}`}
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 8,
                background: syncResult.success ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                border: `1px solid ${syncResult.success ? "var(--success-color)" : "var(--warning-color)"}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <IconCheck size={20} color={syncResult.success ? "var(--success-color)" : "var(--warning-color)"} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  {syncResult.type === "export"
                    ? `¡Sincronización completada! Se transfirieron ${syncResult.count} juegos a la consola Android por cable USB.`
                    : `¡Importación completada! Se copiaron y registraron ${syncResult.count} juegos en tu PC.`}
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                marginTop: 12,
                padding: 10,
                borderRadius: 6,
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid var(--danger-color)",
                color: "var(--danger-color)",
                fontSize: "0.82rem",
              }}
            >
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSyncing}
          >
            Cerrar
          </button>

          {currentDevice && currentDevice.state === "device" && (
            activeTab === "export" ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStartExport}
                disabled={isSyncing || selectedRomsToExport.size === 0}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <IconUpload size={18} />
                {isSyncing
                  ? "Sincronizando por USB..."
                  : `Enviar ${selectedRomsToExport.size} juegos a la consola`}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStartImport}
                disabled={isSyncing || selectedRomsToImport.size === 0}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <IconDownload size={18} />
                {isSyncing
                  ? "Importando por USB..."
                  : `Importar ${selectedRomsToImport.size} juegos al PC`}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
