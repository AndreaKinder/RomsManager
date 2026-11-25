import React, { useState, useEffect } from "react";
import { BUTTON_LABELS, UI_TEXT } from "../../constants/messages";
import {
  IconX,
  IconDeviceDesktop,
  IconUsb,
  IconDeviceGamepad2,
  IconFolder,
  IconRefresh,
  IconCheck,
  IconBrandAndroid,
  IconDownload,
  IconServer,
} from "@tabler/icons-react";
import { EMULATOR_ARG_PRESETS } from "../../../back/services/utils/emulatorArgs";

function SettingsModal({ onClose, isInline = false }) {
  const [diskPath, setDiskPath] = useState("");
  const [showBackupMenu, setShowBackupMenu] = useState(false);
  const [newCollection, setNewCollection] = useState("");
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Storage & Sync state
  const [storageType, setStorageType] = useState("internal");
  const [romsBasePath, setRomsBasePath] = useState("");
  const [pathLayout, setPathLayout] = useState({
    preset: "standard",
    romsPattern: "{base}/Roms/{console}",
    savesPattern: "{base}/Saves/{console}",
    statesPattern: "{base}/States/{console}",
    coversPattern: "{base}/Covers/{console}",
    manualsPattern: "{base}/Manuals/{console}",
    consoleOverrides: {},
  });
  const [isScanningLibrary, setIsScanningLibrary] = useState(false);
  const [scanFeedback, setScanFeedback] = useState(null);
  const [syncEmulationStation, setSyncEmulationStation] = useState(false);
  const [isSyncingGamelists, setIsSyncingGamelists] = useState(false);
  const [esSyncFeedback, setEsSyncFeedback] = useState(null);

  // Emulators state
  const [emulators, setEmulators] = useState({});
  const [availableConsoles, setAvailableConsoles] = useState([]);
  const [newEmulatorConsole, setNewEmulatorConsole] = useState("");
  const [newEmulatorPath, setNewEmulatorPath] = useState("");
  const [newEmulatorArgs, setNewEmulatorArgs] = useState("");

  // RomM state
  const [rommConfig, setRommConfig] = useState({
    enabled: false,
    serverUrl: "",
    authType: "token",
    apiToken: "",
    username: "",
    password: "",
    tlsVerify: true,
    platformMap: {},
    autoSyncSaves: false,
    syncMetadata: true,
    autoDownloadCovers: true,
  });
  const [rommPlatforms, setRommPlatforms] = useState([]);
  const [isTestingRomm, setIsTestingRomm] = useState(false);
  const [rommFeedback, setRommFeedback] = useState(null);

  // Scraper state
  const [scraperConfig, setScraperConfig] = useState({
    defaultScraper: "screenscraper",
    credentials: {
      screenscraper: { developerId: "", developerPassword: "" },
      thegamesdb: { apiKey: "" }
    }
  });

  // ADB state
  const [adbStatus, setAdbStatus] = useState(null);
  const [adbDefaultRemotePath, setAdbDefaultRemotePath] = useState("/sdcard/ROMs");
  const [isDownloadingAdb, setIsDownloadingAdb] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [adbFeedback, setAdbFeedback] = useState(null);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const saved = localStorage.getItem("customCollections");
        const localCollections = saved ? JSON.parse(saved) : [];

        const allRoms = await window.electronAPI.getAllRoms();
        const collectionsFromRoms = new Set();

        Object.keys(allRoms).forEach((consoleId) => {
          const roms = allRoms[consoleId];
          roms.forEach((rom) => {
            if (rom.collections && Array.isArray(rom.collections)) {
              rom.collections.forEach((collectionName) => {
                collectionsFromRoms.add(collectionName);
              });
            }
          });
        });

        const allUniqueCollections = [
          ...new Set([...localCollections, ...Array.from(collectionsFromRoms)]),
        ];

        setCollections(allUniqueCollections);
      } catch (error) {
        console.error("Error loading collections:", error);
        const saved = localStorage.getItem("customCollections");
        const localCollections = saved ? JSON.parse(saved) : [];
        setCollections(localCollections);
      }
    };

    const loadEmulators = async () => {
      try {
        const [emus, consoles] = await Promise.all([
          window.electronAPI.getEmulators(),
          window.electronAPI.getAvailableConsoles(),
        ]);
        setEmulators(emus);
        setAvailableConsoles(consoles);
        if (consoles.length > 0) setNewEmulatorConsole(consoles[0].id);
      } catch (error) {
        console.error("Error loading emulators:", error);
      }
    };

    const loadScraperConfig = async () => {
      try {
        if (window.electronAPI.getScraperConfig) {
          const config = await window.electronAPI.getScraperConfig();
          setScraperConfig(config);
        }
      } catch (error) {
        console.error("Error loading scraper config:", error);
      }
    };

    const loadStorageConfig = async () => {
      try {
        if (window.electronAPI.getAppConfig) {
          const config = await window.electronAPI.getAppConfig();
          setStorageType(config.storageType || "internal");
          setRomsBasePath(config.romsBasePath || "");
          setSyncEmulationStation(Boolean(config.syncEmulationStation));
          if (config.pathLayout) {
            setPathLayout(config.pathLayout);
          }
        }
      } catch (error) {
        console.error("Error loading storage config:", error);
      }
    };

    const loadRommConfig = async () => {
      try {
        if (window.electronAPI.rommGetConfig) {
          const cfg = await window.electronAPI.rommGetConfig();
          if (cfg) setRommConfig(cfg);
        }
      } catch (err) {
        console.error("Error loading RomM config:", err);
      }
    };

    const loadAdbConfig = async () => {
      try {
        if (window.electronAPI.adbGetStatus) {
          const status = await window.electronAPI.adbGetStatus();
          setAdbStatus(status);
          if (status.config?.defaultRemotePath) {
            setAdbDefaultRemotePath(status.config.defaultRemotePath);
          }
        }
      } catch (err) {
        console.error("Error loading ADB status:", err);
      }
    };

    loadCollections();
    loadEmulators();
    loadScraperConfig();
    loadStorageConfig();
    loadRommConfig();
    loadAdbConfig();
  }, []);

  const handleSelectAdbBinary = async () => {
    try {
      const res = await window.electronAPI.adbSelectBinary();
      if (!res.canceled && res.success) {
        setAdbStatus(res);
        setAdbFeedback("Ruta de ADB guardada con éxito");
        setTimeout(() => setAdbFeedback(null), 3000);
      }
    } catch (err) {
      setAdbFeedback("Error: " + err.message);
    }
  };

  const handleDownloadAdb = async () => {
    setIsDownloadingAdb(true);
    setDownloadProgress(0);
    setAdbFeedback(null);
    try {
      const res = await window.electronAPI.adbDownloadInstall();
      if (res.success) {
        setAdbStatus(res);
        setAdbFeedback("ADB instalado correctamente");
        setTimeout(() => setAdbFeedback(null), 3000);
      } else {
        setAdbFeedback("Error: " + res.error);
      }
    } catch (err) {
      setAdbFeedback("Error: " + err.message);
    } finally {
      setIsDownloadingAdb(false);
    }
  };

  const handleUpdateAdbRemotePath = async (val) => {
    setAdbDefaultRemotePath(val);
    try {
      await window.electronAPI.adbSetConfig({ defaultRemotePath: val });
    } catch (err) {
      console.error("Error saving adb remote path:", err);
    }
  };

  const handleSelectStorageType = async (type) => {
    setStorageType(type);
    try {
      await window.electronAPI.setStorageType(type);
    } catch (err) {
      console.error("Error setting storage type:", err);
    }
  };

  const handleSelectRomsFolder = async () => {
    try {
      const folder = await window.electronAPI.selectRomsFolder();
      if (folder) {
        setRomsBasePath(folder);
        await window.electronAPI.setRomsBasePath(folder);
      }
    } catch (err) {
      console.error("Error selecting folder:", err);
    }
  };

  const handlePathLayoutPresetChange = async (preset) => {
    try {
      const res = await window.electronAPI.setPathLayout({ preset });
      if (res?.layout) setPathLayout(res.layout);
    } catch (err) {
      console.error("Error updating path layout preset:", err);
    }
  };

  const handlePathPatternChange = async (field, value) => {
    const updated = { ...pathLayout, preset: "custom", [field]: value };
    setPathLayout(updated);
    try {
      await window.electronAPI.setPathLayout(updated);
    } catch (err) {
      console.error("Error updating path pattern:", err);
    }
  };

  const handleScanLocalLibrary = async () => {
    setIsScanningLibrary(true);
    setScanFeedback(null);
    try {
      const res = await window.electronAPI.scanLocalLibrary({ pruneMissing: false });
      if (res?.success) {
        setScanFeedback(
          `Escaneo completado (${res.consolesScanned} consolas): ${res.added} añadidas, ${res.updated} actualizadas.`,
        );
      } else {
        setScanFeedback("Error: " + (res?.error || "Desconocido"));
      }
    } catch (err) {
      setScanFeedback("Error: " + err.message);
    } finally {
      setIsScanningLibrary(false);
    }
  };

  const handleRommConfigUpdate = async (patch) => {
    const next = { ...rommConfig, ...patch };
    setRommConfig(next);
    try {
      await window.electronAPI.rommSetConfig(next);
    } catch (err) {
      console.error("Error saving RomM config:", err);
    }
  };

  const handleDetectRommSync = async () => {
    try {
      const detected = await window.electronAPI.rommDetectRommSync();
      if (!detected?.found) {
        setRommFeedback("No se encontró ninguna instalación de romm-sync en este equipo.");
        return;
      }
      await handleRommConfigUpdate({
        enabled: true,
        serverUrl: detected.serverUrl,
        authType: detected.authType,
        apiToken: detected.apiToken,
        username: detected.username,
        tlsVerify: detected.tlsVerify,
      });
      setRommFeedback(`Datos importados desde ${detected.sourcePath}`);
    } catch (err) {
      setRommFeedback("Error: " + err.message);
    }
  };

  const handleTestRommConnection = async () => {
    setIsTestingRomm(true);
    setRommFeedback(null);
    try {
      const res = await window.electronAPI.rommTestConnection(rommConfig);
      if (res?.success) {
        setRommPlatforms(res.platforms || []);
        setRommFeedback(
          `Conectado${res.serverVersion ? ` (RomM v${res.serverVersion})` : ""}: ${res.platformCount} plataformas detectadas.`,
        );
      } else {
        setRommFeedback("Error de conexión: " + (res?.error || "Desconocido"));
      }
    } catch (err) {
      setRommFeedback("Error: " + err.message);
    } finally {
      setIsTestingRomm(false);
    }
  };

  const handleRommPlatformMapChange = async (rommSlug, localConsoleId) => {
    const nextMap = { ...(rommConfig.platformMap || {}), [rommSlug]: localConsoleId };
    await handleRommConfigUpdate({ platformMap: nextMap });
  };

  const handleToggleSyncEmulationStation = async () => {
    const nextVal = !syncEmulationStation;
    setSyncEmulationStation(nextVal);
    try {
      await window.electronAPI.setSyncEmulationStation(nextVal);
    } catch (err) {
      console.error("Error toggling syncEmulationStation:", err);
    }
  };

  const handleManualSyncAllGamelists = async () => {
    setIsSyncingGamelists(true);
    setEsSyncFeedback(null);
    try {
      const res = await window.electronAPI.syncAllGamelists();
      if (res && res.success) {
        setEsSyncFeedback(
          `¡Sincronizado! Se actualizaron ${res.syncedConsoles} consolas (${res.totalGames} juegos).`,
        );
      } else {
        setEsSyncFeedback("Error al sincronizar: " + (res?.error || "Desconocido"));
      }
    } catch (err) {
      setEsSyncFeedback("Error: " + err.message);
    } finally {
      setIsSyncingGamelists(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.className === "modal-backdrop") {
      onClose();
    }
  };

  const handleDiskPathChange = (e) => {
    setDiskPath(e.target.value);
  };

  const handleNewCollectionChange = (e) => {
    setNewCollection(e.target.value);
  };

  const handleAddCollection = () => {
    const trimmedCollection = newCollection.trim();

    if (!trimmedCollection) {
      alert("Por favor ingresa un nombre de colección");
      return;
    }

    if (collections.includes(trimmedCollection)) {
      alert("Esta colección ya existe");
      return;
    }

    const updatedCollections = [...collections, trimmedCollection];
    setCollections(updatedCollections);
    localStorage.setItem(
      "customCollections",
      JSON.stringify(updatedCollections),
    );
    setNewCollection("");
  };

  const handleRemoveCollection = (collectionToRemove) => {
    const updatedCollections = collections.filter(
      (col) => col !== collectionToRemove,
    );
    setCollections(updatedCollections);
    localStorage.setItem(
      "customCollections",
      JSON.stringify(updatedCollections),
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCollection();
    }
  };

  const handleExport = async () => {
    if (!diskPath.trim()) {
      alert("Por favor ingresa una ruta válida");
      return;
    }
    setShowBackupMenu(false);
    setIsLoading(true);
    try {
      const result = await window.electronAPI.exportBackup(diskPath.trim());
      if (result.success) {
        alert(
          `¡Copia de seguridad exportada exitosamente!\n\n${result.outputPath}`,
        );
        onClose();
      } else {
        alert("Error al exportar la copia de seguridad: " + result.error);
      }
    } catch (error) {
      console.error("Error al exportar copia de seguridad:", error);
      alert("Error al exportar la copia de seguridad: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    setShowBackupMenu(false);
    setIsLoading(true);
    try {
      const result = await window.electronAPI.importBackup(
        diskPath.trim() || undefined,
      );
      if (result.canceled) return;
      if (result.success) {
        alert("¡Copia de seguridad importada exitosamente!");
        onClose();
      } else {
        alert("Error al importar la copia de seguridad: " + result.error);
      }
    } catch (error) {
      console.error("Error al importar copia de seguridad:", error);
      alert("Error al importar la copia de seguridad: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  // Emulator handlers
  const handleSelectEmulatorFile = async () => {
    const filePath = await window.electronAPI.selectEmulatorFile();
    if (filePath) setNewEmulatorPath(filePath);
  };

  const handleAddEmulator = async () => {
    if (!newEmulatorConsole) {
      alert("Seleccioná una consola");
      return;
    }
    if (!newEmulatorPath.trim()) {
      alert("Seleccioná el ejecutable del emulador");
      return;
    }

    const entry = {
      path: newEmulatorPath,
      args: newEmulatorArgs.trim(),
      workingDir: "",
    };
    await window.electronAPI.setEmulator(newEmulatorConsole, entry);
    setEmulators((prev) => ({
      ...prev,
      [newEmulatorConsole]: entry,
    }));
    setNewEmulatorPath("");
    setNewEmulatorArgs("");
  };

  const handleRemoveEmulator = async (consoleId) => {
    await window.electronAPI.removeEmulator(consoleId);
    setEmulators((prev) => {
      const next = { ...prev };
      delete next[consoleId];
      return next;
    });
  };

  const handleScraperConfigChange = async (field, value, subfield = null) => {
    const newConfig = { ...scraperConfig };
    if (subfield) {
      if (!newConfig.credentials[field]) newConfig.credentials[field] = {};
      newConfig.credentials[field][subfield] = value;
    } else {
      newConfig[field] = value;
    }
    setScraperConfig(newConfig);
    if (window.electronAPI.setScraperConfig) {
      await window.electronAPI.setScraperConfig(newConfig);
    }
  };

  const getConsoleName = (consoleId) => {
    const found = availableConsoles.find((c) => c.id === consoleId);
    return found ? found.name : consoleId.toUpperCase();
  };

  const getFileName = (filePath) => {
    if (!filePath) return "";
    return filePath.split(/[\\/]/).pop();
  };

  const configuredConsoleIds = Object.keys(emulators);

  return (
    <div
      className={isInline ? "inline-view-content" : "modal-backdrop"}
      onClick={isInline ? undefined : handleBackdropClick}
    >
      <div
        className={isInline ? "" : "modal-content settings-modal"}
        onClick={isInline ? undefined : (e) => e.stopPropagation()}
      >
        <div className={isInline ? "inline-view-header" : "modal-header"}>
          <h2>Configuración</h2>
          {!isInline && (
            <button className="modal-close-btn" onClick={onClose}>
              <IconX size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className={isInline ? "inline-view-body" : "modal-body"}>
            {/* Almacenamiento y Sincronización */}
            <div className="form-field">
              <label>Almacenamiento de ROMs y Datos</label>

              <div className="storage-options-grid" style={{ marginBottom: 12 }}>
                <div
                  className={`storage-card ${storageType === "internal" ? "selected" : ""}`}
                  onClick={() => handleSelectStorageType("internal")}
                >
                  <div className="storage-card-icon">
                    <IconDeviceDesktop size={20} />
                  </div>
                  <div className="storage-card-title">
                    Disco Interno
                    {storageType === "internal" && (
                      <IconCheck size={16} color="var(--primary-color)" />
                    )}
                  </div>
                  <div className="storage-card-desc">
                    Datos en tu usuario local. Ideal para jugar en este equipo.
                  </div>
                </div>

                <div
                  className={`storage-card ${storageType === "external" ? "selected" : ""}`}
                  onClick={() => handleSelectStorageType("external")}
                >
                  <div className="storage-card-icon">
                    <IconUsb size={20} />
                  </div>
                  <div className="storage-card-title">
                    Disco Externo / SD
                    {storageType === "external" && (
                      <IconCheck size={16} color="var(--primary-color)" />
                    )}
                  </div>
                  <div className="storage-card-desc">
                    ROMs y base de datos portátiles en unidad externa o SD.
                  </div>
                </div>
              </div>

              <div className="collection-input-container">
                <input
                  type="text"
                  value={romsBasePath}
                  readOnly
                  placeholder="Ninguna carpeta seleccionada"
                  style={{ cursor: "default" }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleSelectRomsFolder}
                  disabled={isLoading}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <IconFolder size={16} />
                  Cambiar
                </button>
              </div>
              {romsBasePath && (
                <p className="form-hint" style={{ marginTop: 6 }}>
                  Ruta base: <strong>{romsBasePath}</strong>
                  {storageType === "external" && (
                    <span>
                      {" "}
                      | Base de datos:{" "}
                      <strong>{romsBasePath}/database</strong>
                    </span>
                  )}
                </p>
              )}

              {/* Estructura de carpetas personalizable y escáner local */}
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 8,
                  background: "var(--surface)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    Estructura de carpetas:
                  </span>
                  <select
                    value={pathLayout.preset || "standard"}
                    onChange={(e) => handlePathLayoutPresetChange(e.target.value)}
                    style={{ flex: 1, minWidth: 180 }}
                  >
                    <option value="standard">ROM Manager (Estándar)</option>
                    <option value="romm">RomM / RommDeck ({`{console}/games`})</option>
                    <option value="emulationstation">EmulationStation / ES-DE / EmuDeck</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    ROMs:
                    <input
                      type="text"
                      value={pathLayout.romsPattern || ""}
                      onChange={(e) => handlePathPatternChange("romsPattern", e.target.value)}
                      style={{ width: "100%", marginTop: 2, fontSize: "0.8rem" }}
                    />
                  </label>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    Saves:
                    <input
                      type="text"
                      value={pathLayout.savesPattern || ""}
                      onChange={(e) => handlePathPatternChange("savesPattern", e.target.value)}
                      style={{ width: "100%", marginTop: 2, fontSize: "0.8rem" }}
                    />
                  </label>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    States:
                    <input
                      type="text"
                      value={pathLayout.statesPattern || ""}
                      onChange={(e) => handlePathPatternChange("statesPattern", e.target.value)}
                      style={{ width: "100%", marginTop: 2, fontSize: "0.8rem" }}
                    />
                  </label>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    Covers:
                    <input
                      type="text"
                      value={pathLayout.coversPattern || ""}
                      onChange={(e) => handlePathPatternChange("coversPattern", e.target.value)}
                      style={{ width: "100%", marginTop: 2, fontSize: "0.8rem" }}
                    />
                  </label>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleScanLocalLibrary}
                    disabled={isScanningLibrary || !romsBasePath}
                    style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem" }}
                  >
                    <IconRefresh
                      size={15}
                      className={isScanningLibrary ? "spin-animation" : ""}
                    />
                    {isScanningLibrary ? "Escaneando..." : "Escanear biblioteca local"}
                  </button>
                  {scanFeedback && (
                    <span style={{ fontSize: 12, color: "var(--success-color)" }}>
                      {scanFeedback}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Integración con RomM (Opcional y personalizable) */}
            <div className="form-field">
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <IconServer size={18} />
                Servidor RomM (Opcional)
              </label>

              <div
                style={{
                  background: "var(--surface)",
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={Boolean(rommConfig.enabled)}
                      onChange={(e) => handleRommConfigUpdate({ enabled: e.target.checked })}
                    />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      Habilitar integración con RomM
                    </span>
                  </label>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleDetectRommSync}
                    style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                  >
                    Importar de romm-sync
                  </button>
                </div>

                {rommConfig.enabled && (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <input
                        type="url"
                        value={rommConfig.serverUrl || ""}
                        onChange={(e) => handleRommConfigUpdate({ serverUrl: e.target.value })}
                        placeholder="https://romm.tudominio.com o http://192.168.1.10:4002"
                      />

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <select
                          value={rommConfig.authType || "token"}
                          onChange={(e) => handleRommConfigUpdate({ authType: e.target.value })}
                        >
                          <option value="token">API Token</option>
                          <option value="basic">Usuario y contraseña</option>
                        </select>

                        {rommConfig.authType === "basic" ? (
                          <>
                            <input
                              type="text"
                              value={rommConfig.username || ""}
                              onChange={(e) => handleRommConfigUpdate({ username: e.target.value })}
                              placeholder="Usuario"
                              style={{ flex: 1 }}
                            />
                            <input
                              type="password"
                              value={rommConfig.password || ""}
                              onChange={(e) => handleRommConfigUpdate({ password: e.target.value })}
                              placeholder="Contraseña"
                              style={{ flex: 1 }}
                            />
                          </>
                        ) : (
                          <input
                            type="password"
                            value={rommConfig.apiToken || ""}
                            onChange={(e) => handleRommConfigUpdate({ apiToken: e.target.value })}
                            placeholder="Token API de RomM (rmm_...)"
                            style={{ flex: 1 }}
                          />
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: "0.8rem" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                          <input
                            type="checkbox"
                            checked={rommConfig.tlsVerify !== false}
                            onChange={(e) => handleRommConfigUpdate({ tlsVerify: e.target.checked })}
                          />
                          Verificar certificado TLS
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                          <input
                            type="checkbox"
                            checked={rommConfig.autoDownloadCovers !== false}
                            onChange={(e) => handleRommConfigUpdate({ autoDownloadCovers: e.target.checked })}
                          />
                          Descargar carátulas automáticamente
                        </label>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleTestRommConnection}
                          disabled={isTestingRomm || !rommConfig.serverUrl}
                          style={{ fontSize: "0.8rem" }}
                        >
                          {isTestingRomm ? "Probando..." : "Probar conexión"}
                        </button>
                        {rommFeedback && (
                          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                            {rommFeedback}
                          </span>
                        )}
                      </div>

                      {rommPlatforms.length > 0 && (
                        <div style={{ marginTop: 6 }}>
                          <div style={{ fontSize: "0.78rem", fontWeight: 600, marginBottom: 4 }}>
                            Mapeo de plataformas RomM → Consola local:
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                            {rommPlatforms.map((p) => (
                              <div
                                key={p.id}
                                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem" }}
                              >
                                <span style={{ minWidth: 90 }}>{p.slug}:</span>
                                <select
                                  value={rommConfig.platformMap?.[p.slug] || p.mappedConsoleId || ""}
                                  onChange={(e) => handleRommPlatformMapChange(p.slug, e.target.value)}
                                  style={{ flex: 1, fontSize: "0.78rem" }}
                                >
                                  {availableConsoles.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name} ({c.id})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sincronización con Emulation Station */}
            <div className="form-field">
              <label>Emulation Station</label>
              <div
                className={`sync-switch-card ${syncEmulationStation ? "active" : ""}`}
                onClick={handleToggleSyncEmulationStation}
                style={{ marginTop: 0 }}
              >
                <div className="sync-switch-info">
                  <div className="sync-switch-header">
                    <IconDeviceGamepad2
                      size={20}
                      color={
                        syncEmulationStation
                          ? "var(--success-color)"
                          : "var(--text-secondary)"
                      }
                    />
                    <span>
                      Sincronizar automáticamente con Emulation Station
                    </span>
                    {syncEmulationStation && (
                      <span className="sync-feedback-badge">Activo</span>
                    )}
                  </div>
                  <div className="sync-switch-desc">
                    Mantiene sincronizados los archivos <code>gamelist.xml</code>{" "}
                    y carátulas en cada carpeta de consola.
                  </div>
                </div>

                <label
                  className="custom-toggle"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={syncEmulationStation}
                    onChange={handleToggleSyncEmulationStation}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {syncEmulationStation && (
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleManualSyncAllGamelists}
                    disabled={isSyncingGamelists || !romsBasePath}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <IconRefresh
                      size={16}
                      className={isSyncingGamelists ? "spin-animation" : ""}
                    />
                    {isSyncingGamelists
                      ? "Sincronizando..."
                      : "Sincronizar gamelist.xml ahora"}
                  </button>
                  {esSyncFeedback && (
                    <span
                      style={{ fontSize: 12, color: "var(--success-color)" }}
                    >
                      {esSyncFeedback}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Consolas Android (ADB / USB) */}
            <div className="form-field">
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <IconBrandAndroid size={18} color="var(--success-color)" />
                Consolas Android (Sincronización por cable USB)
              </label>

              <div
                style={{
                  background: "var(--surface)",
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Estado de ADB: </span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: adbStatus?.installed ? "var(--success-color)" : "var(--warning-color)",
                        fontWeight: 600,
                      }}
                    >
                      {adbStatus?.installed
                        ? `Instalado (versión ${adbStatus.version})`
                        : "No detectado"}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    {!adbStatus?.installed && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleDownloadAdb}
                        disabled={isDownloadingAdb}
                        style={{ fontSize: "0.75rem", padding: "4px 8px", display: "flex", alignItems: "center", gap: 4 }}
                      >
                        <IconDownload size={14} />
                        {isDownloadingAdb ? `Descargando (${downloadProgress}%)...` : "Instalar ADB"}
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleSelectAdbBinary}
                      style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                    >
                      {adbStatus?.installed ? "Cambiar ruta adb..." : "Buscar adb..."}
                    </button>
                  </div>
                </div>

                {adbStatus?.path && (
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0 0 8px 0" }}>
                    Ejecutable: <code>{adbStatus.path}</code>
                  </p>
                )}

                <div style={{ marginTop: 8 }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                    Carpeta ROMs por defecto en la consola Android:
                  </label>
                  <input
                    type="text"
                    value={adbDefaultRemotePath}
                    onChange={(e) => handleUpdateAdbRemotePath(e.target.value)}
                    placeholder="/sdcard/ROMs"
                    style={{
                      width: "100%",
                      fontSize: "0.85rem",
                      padding: "6px 8px",
                      background: "var(--background)",
                      border: "1px solid var(--border-color)",
                      borderRadius: 6,
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

                {adbFeedback && (
                  <span style={{ fontSize: 12, color: "var(--success-color)", display: "block", marginTop: 6 }}>
                    {adbFeedback}
                  </span>
                )}
              </div>
            </div>

            {/* Backup */}
            <div className="form-field">
              <label htmlFor="diskPath">{UI_TEXT.SG_PATH_LABEL}</label>
              <div className="collection-input-container">
                <input
                  type="text"
                  id="diskPath"
                  value={diskPath}
                  onChange={handleDiskPathChange}
                  placeholder={UI_TEXT.SG_PATH_PLACEHOLDER}
                  disabled={isLoading}
                />
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={isLoading}
                    onClick={() => setShowBackupMenu((prev) => !prev)}
                  >
                    {isLoading ? "Procesando..." : BUTTON_LABELS.SYNC_DATA}
                  </button>
                  {showBackupMenu && (
                    <div>
                      <button
                        type="button"
                        disabled={!diskPath.trim()}
                        onClick={handleExport}
                      >
                        Exportar
                      </button>
                      <button type="button" onClick={handleImport}>
                        Importar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Emulators */}
            <div className="form-field">
              <label>Emuladores</label>

              {configuredConsoleIds.length > 0 && (
                <div className="collections-list" style={{ marginBottom: 12 }}>
                  {configuredConsoleIds.map((consoleId) => {
                    const entry = emulators[consoleId];
                    const emuPath = typeof entry === "string" ? entry : entry?.path || "";
                    const emuArgs = typeof entry === "string" ? "" : entry?.args || "";
                    return (
                      <div
                        key={consoleId}
                        className="collection-tag"
                        style={{ justifyContent: "space-between", gap: 8 }}
                      >
                        <span style={{ fontWeight: 600, minWidth: 60 }}>
                          {getConsoleName(consoleId)}
                        </span>
                        <span title={`${emuPath}${emuArgs ? ` ${emuArgs}` : ""}`}>
                          {getFileName(emuPath)}
                          {emuArgs ? ` (${emuArgs})` : ""}
                        </span>
                        <button
                          type="button"
                          className="collection-remove-btn"
                          onClick={() => handleRemoveEmulator(consoleId)}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div
                className="collection-input-container"
                style={{ flexWrap: "wrap", gap: 8 }}
              >
                <select
                  value={newEmulatorConsole}
                  onChange={(e) => setNewEmulatorConsole(e.target.value)}
                  disabled={isLoading}
                  style={{ flex: "0 0 auto" }}
                >
                  {availableConsoles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div style={{ display: "flex", gap: 8, flex: 1 }}>
                  <input
                    type="text"
                    value={newEmulatorPath ? getFileName(newEmulatorPath) : ""}
                    readOnly
                    placeholder="Ningún emulador seleccionado"
                    style={{ cursor: "default", flex: 1 }}
                    title={newEmulatorPath}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleSelectEmulatorFile}
                    disabled={isLoading}
                  >
                    Explorar
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddEmulator}
                  disabled={isLoading || !newEmulatorPath}
                >
                  Añadir
                </button>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <select
                  value=""
                  onChange={(e) => {
                    const preset = EMULATOR_ARG_PRESETS.find((p) => p.id === e.target.value);
                    if (preset) setNewEmulatorArgs(preset.args);
                  }}
                  style={{ maxWidth: 220 }}
                >
                  <option value="">Preset de argumentos...</option>
                  {EMULATOR_ARG_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newEmulatorArgs}
                  onChange={(e) => setNewEmulatorArgs(e.target.value)}
                  placeholder='Argumentos opcionales (ej. -b -e "{rom}")'
                  style={{ flex: 1, minWidth: 180 }}
                />
              </div>

              <p className="form-hint" style={{ marginTop: 8 }}>
                Asigna un emulador y argumentos opcionales a cada consola. Variables disponibles:{" "}
                <code>{"{rom}"}</code>, <code>{"{romDir}"}</code>, <code>{"{saveDir}"}</code>,{" "}
                <code>{"{stateDir}"}</code>.
              </p>
            </div>

            {/* Scraper Config */}
            <div className="form-field">
              <label>Configuración de Scraper</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ minWidth: "150px" }}>Proveedor por defecto:</span>
                  <select 
                    value={scraperConfig.defaultScraper}
                    onChange={(e) => handleScraperConfigChange("defaultScraper", e.target.value)}
                    style={{ flex: 1 }}
                  >
                    <option value="screenscraper">ScreenScraper (Recomendado)</option>
                    <option value="thegamesdb">TheGamesDB</option>
                    <option value="romm">RomM (Tu servidor)</option>
                  </select>
                </div>

                {scraperConfig.defaultScraper === "screenscraper" && (
                  <div style={{ padding: "10px", background: "rgba(0,0,0,0.2)", borderRadius: "4px" }}>
                    <p style={{ fontSize: "12px", marginBottom: "8px", color: "var(--text-secondary)" }}>
                      ScreenScraper permite uso anónimo básico, pero si ingresas tus credenciales evitarás bloqueos.
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <span style={{ minWidth: "140px", fontSize: "12px" }}>Dev ID (Opcional):</span>
                      <input 
                        type="text" 
                        value={scraperConfig.credentials?.screenscraper?.developerId || ""}
                        onChange={(e) => handleScraperConfigChange("screenscraper", e.target.value, "developerId")}
                        style={{ flex: 1, padding: "4px" }}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ minWidth: "140px", fontSize: "12px" }}>Dev Pwd (Opcional):</span>
                      <input 
                        type="password" 
                        value={scraperConfig.credentials?.screenscraper?.developerPassword || ""}
                        onChange={(e) => handleScraperConfigChange("screenscraper", e.target.value, "developerPassword")}
                        style={{ flex: 1, padding: "4px" }}
                      />
                    </div>
                  </div>
                )}

                {scraperConfig.defaultScraper === "thegamesdb" && (
                  <div style={{ padding: "10px", background: "rgba(0,0,0,0.2)", borderRadius: "4px" }}>
                    <p style={{ fontSize: "12px", marginBottom: "8px", color: "var(--text-secondary)" }}>
                      TheGamesDB requiere una API Key para funcionar correctamente.
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ minWidth: "140px", fontSize: "12px" }}>API Key:</span>
                      <input 
                        type="text" 
                        value={scraperConfig.credentials?.thegamesdb?.apiKey || ""}
                        onChange={(e) => handleScraperConfigChange("thegamesdb", e.target.value, "apiKey")}
                        style={{ flex: 1, padding: "4px" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Collections */}
            <div className="form-field">
              <label htmlFor="newCollection">Colecciones Personalizadas</label>
              <div className="collection-input-container">
                <input
                  type="text"
                  id="newCollection"
                  value={newCollection}
                  onChange={handleNewCollectionChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Nombre de la colección (ej: Favoritos, RPG)"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddCollection}
                  disabled={isLoading || !newCollection.trim()}
                >
                  Añadir
                </button>
              </div>

              {collections.length > 0 && (
                <div className="collections-list">
                  {collections.map((collection, index) => (
                    <div key={index} className="collection-tag">
                      <span>{collection}</span>
                      <button
                        type="button"
                        className="collection-remove-btn"
                        onClick={() => handleRemoveCollection(collection)}
                        disabled={isLoading}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="form-hint">
                Las colecciones te permiten agrupar ROMs de diferentes consolas.
                Añade las colecciones aquí y luego podrás asignarlas a tus ROMs.
              </p>
            </div>
          </div>

          {!isInline && (
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                {BUTTON_LABELS.CLOSE}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default SettingsModal;
