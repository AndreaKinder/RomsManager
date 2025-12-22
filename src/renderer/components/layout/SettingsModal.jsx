import React, { useState, useEffect } from "react";
import { BUTTON_LABELS, UI_TEXT } from "../../constants/messages";

function SettingsModal({ onClose }) {
  const [diskPath, setDiskPath] = useState("");
  const [newCollection, setNewCollection] = useState("");
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

    loadCollections();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!diskPath.trim()) {
      alert("Por favor ingresa una ruta válida");
      return;
    }

    setIsLoading(true);

    try {
      // Aquí implementarás la lógica para crear la copia de seguridad
      // Por ejemplo: await window.api.createBackup(diskPath);
      console.log("Creando copia de seguridad en:", diskPath);

      // Simulación de proceso (remover en producción)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("¡Copia de seguridad creada exitosamente!");
      onClose();
    } catch (error) {
      console.error("Error al crear copia de seguridad:", error);
      alert("Error al crear la copia de seguridad: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Configuración</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || !diskPath.trim()}
                >
                  {isLoading ? "Guardando..." : BUTTON_LABELS.SYNC_DATA}
                </button>
              </div>
            </div>

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
                  ➕ Añadir
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
