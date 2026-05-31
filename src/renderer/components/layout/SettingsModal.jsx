import React, { useState, useEffect } from "react";
import { BUTTON_LABELS, UI_TEXT } from "../../constants/messages";
import { IconX } from "@tabler/icons-react";

function SettingsModal({ onClose }) {
  const [diskPath, setDiskPath] = useState("");
  const [showBackupMenu, setShowBackupMenu] = useState(false);
  const [newCollection, setNewCollection] = useState("");
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Emulators state
  const [emulators, setEmulators] = useState({});
  const [availableConsoles, setAvailableConsoles] = useState([]);
  const [newEmulatorConsole, setNewEmulatorConsole] = useState("");
  const [newEmulatorPath, setNewEmulatorPath] = useState("");

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

    loadCollections();
    loadEmulators();
  }, []);

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
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Configuración</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 4px)",
                        background: "var(--bg-secondary, #2a2a2a)",
                        border: "1px solid var(--border-color, #444)",
                        borderRadius: 6,
                        overflow: "hidden",
                        zIndex: 100,
                        minWidth: 130,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                      }}
                    >
                      <button
                        type="button"
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px 16px",
                          textAlign: "left",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "inherit",
                        }}
                        disabled={!diskPath.trim()}
                        onClick={handleExport}
                      >
                        Exportar
                      </button>
                      <button
                        type="button"
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px 16px",
                          textAlign: "left",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "inherit",
                        }}
                        onClick={handleImport}
                      >
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
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: 12,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                        }}
                        title={emulators[consoleId]}
                      >
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
        </form>
      </div>
    </div>
  );
}

export default SettingsModal;
