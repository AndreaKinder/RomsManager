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
} from "@tabler/icons-react";

function SettingsModal({ onClose, isInline = false }) {
  const [diskPath, setDiskPath] = useState("");
  const [showBackupMenu, setShowBackupMenu] = useState(false);
  const [newCollection, setNewCollection] = useState("");
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Storage & Sync state
  const [storageType, setStorageType] = useState("internal");
  const [romsBasePath, setRomsBasePath] = useState("");
  const [syncEmulationStation, setSyncEmulationStation] = useState(false);
  const [isSyncingGamelists, setIsSyncingGamelists] = useState(false);
  const [esSyncFeedback, setEsSyncFeedback] = useState(null);

  // Emulators state
  const [emulators, setEmulators] = useState({});
  const [availableConsoles, setAvailableConsoles] = useState([]);
  const [newEmulatorConsole, setNewEmulatorConsole] = useState("");
  const [newEmulatorPath, setNewEmulatorPath] = useState("");

  // Scraper state
  const [scraperConfig, setScraperConfig] = useState({
    defaultScraper: "screenscraper",
    credentials: {
      screenscraper: { developerId: "", developerPassword: "" },
      thegamesdb: { apiKey: "" },
      igdb: { clientId: "", clientSecret: "" }
    }
  });

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
        }
      } catch (error) {
        console.error("Error loading storage config:", error);
      }
    };

    loadCollections();
    loadEmulators();
    loadScraperConfig();
    loadStorageConfig();
  }, []);

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

    await window.electronAPI.setEmulator(newEmulatorConsole, newEmulatorPath);
    setEmulators((prev) => ({
      ...prev,
      [newEmulatorConsole]: newEmulatorPath,
    }));
    setNewEmulatorPath("");
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
  const unconfiuredConsoles = availableConsoles.filter((c) => !emulators[c.id]);

  return (
    <div
      className={isInline ? "inline-view-content" : "modal-backdrop"}
      onClick={isInline ? undefined : handleBackdropClick}
    >
      <div
        className={isInline ? "" : "modal-content"}
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
                  Ruta base: <strong>{romsBasePath}/Roms</strong>
                  {storageType === "external" && (
                    <span>
                      {" "}
                      | Base de datos:{" "}
                      <strong>{romsBasePath}/database</strong>
                    </span>
                  )}
                </p>
              )}
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
                  {configuredConsoleIds.map((consoleId) => (
                    <div
                      key={consoleId}
                      className="collection-tag"
                      style={{ justifyContent: "space-between", gap: 8 }}
                    >
                      <span style={{ fontWeight: 600, minWidth: 60 }}>
                        {getConsoleName(consoleId)}
                      </span>
                      <span title={emulators[consoleId]}>
                        {getFileName(emulators[consoleId])}
                      </span>
                      <button
                        type="button"
                        className="collection-remove-btn"
                        onClick={() => handleRemoveEmulator(consoleId)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
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

              <p className="form-hint" style={{ marginTop: 8 }}>
                Asigná un emulador a cada consola. La ROM se pasa como primer
                argumento al ejecutable.
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
