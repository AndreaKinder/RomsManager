import React, { useState } from "react";

function FirstRunModal({ onComplete }) {
  const [selectedPath, setSelectedPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectFolder = async () => {
    const folderPath = await window.electronAPI.selectRomsFolder();
    if (folderPath) {
      setSelectedPath(folderPath);
    }
  };

  const handleConfirm = async () => {
    if (!selectedPath.trim()) {
      alert("Por favor seleccioná una carpeta para tus ROMs");
      return;
    }
    setIsLoading(true);
    try {
      await window.electronAPI.setRomsBasePath(selectedPath);
      onComplete();
    } catch (error) {
      console.error("Error al guardar la ruta:", error);
      alert("Error al guardar la ruta: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h2>Bienvenido a RomsManager</h2>
        </div>

        <div className="modal-body">
          <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
            Para empezar, seleccioná la carpeta donde vas a guardar tus ROMs.
            Esta ruta se va a usar como base para organizar todo: ROMs, Saves,
            Covers y Manuals.
          </p>

          <div className="form-field">
            <label>Carpeta de ROMs</label>
            <div className="collection-input-container">
              <input
                type="text"
                value={selectedPath}
                readOnly
                placeholder="Ninguna carpeta seleccionada"
                style={{ cursor: "default" }}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSelectFolder}
                disabled={isLoading}
              >
                Explorar
              </button>
            </div>
            {selectedPath && (
              <p className="form-hint" style={{ marginTop: 8 }}>
                Las ROMs se guardarán en: <strong>{selectedPath}/Roms</strong>
              </p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={isLoading || !selectedPath.trim()}
          >
            {isLoading ? "Guardando..." : "Comenzar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FirstRunModal;
