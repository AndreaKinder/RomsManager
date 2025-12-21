import React, { useState } from "react";
import { BUTTON_LABELS, UI_TEXT } from "../../constants/messages";

function SettingsModal({ onClose }) {
  const [diskPath, setDiskPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBackdropClick = (e) => {
    if (e.target.className === "modal-backdrop") {
      onClose();
    }
  };

  const handleDiskPathChange = (e) => {
    setDiskPath(e.target.value);
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
              <input
                type="text"
                id="diskPath"
                value={diskPath}
                onChange={handleDiskPathChange}
                placeholder={UI_TEXT.SG_PATH_PLACEHOLDER}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              {BUTTON_LABELS.CANCEL}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : BUTTON_LABELS.SYNC_DATA}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsModal;
