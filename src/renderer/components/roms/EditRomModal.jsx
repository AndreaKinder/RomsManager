import React, { useState } from "react";
import {
  VALIDATION_MESSAGES,
  ERROR_MESSAGES,
  BUTTON_LABELS,
  MAX_TITLE_LENGTH,
} from "../../constants/messages";

function EditRomModal({ rom, onClose, onSave }) {
  const [title, setTitle] = useState(rom.title);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSaveFile, setSelectedSaveFile] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación: título vacío
    if (!title.trim()) {
      setError(VALIDATION_MESSAGES.EMPTY_TITLE);
      return;
    }

    // Validación: longitud máxima
    if (title.length > MAX_TITLE_LENGTH) {
      setError(VALIDATION_MESSAGES.MAX_TITLE_LENGTH(MAX_TITLE_LENGTH));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.editRomTitle(rom.romName, title);

      if (result.success) {
        const fileExtension = rom.romName.split(".").pop();
        await window.electronAPI.editRomName(
          rom.romName,
          `${title}.${fileExtension}`,
        );
        onSave();
      } else {
        setError(result.error || ERROR_MESSAGES.UPDATE_ROM("desconocido"));
      }
    } catch (err) {
      setError(ERROR_MESSAGES.CONNECTION_ERROR(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSaveFile = async () => {
    try {
      const filePath = await window.electronAPI.selectSaveFile();
      if (filePath) {
        setSelectedSaveFile(filePath);
        setError(null);
        setSaveMessage(null);
      }
    } catch (err) {
      setError(ERROR_MESSAGES.SELECT_FILE(err.message));
    }
  };

  const handleImportSave = async () => {
    if (!selectedSaveFile) {
      setError("Por favor selecciona un archivo de guardado primero");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSaveMessage(null);

    try {
      const result = await window.electronAPI.addSaveFromPC(
        rom.romName,
        rom.system,
        selectedSaveFile,
      );

      if (result.success) {
        setSaveMessage(
          `Partida guardada importada exitosamente para ${result.romName}`,
        );
        setSelectedSaveFile(null);
      } else {
        setError(result.error || ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    } catch (err) {
      setError(ERROR_MESSAGES.CONNECTION_ERROR(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.className === "modal-backdrop") {
      onClose();
    }
  };

  const getFileName = (path) => {
    if (!path) return "";
    return path.split(/[\\/]/).pop();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Editar ROM</h2>
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
              <label htmlFor="romName">Archivo ROM</label>
              <input
                type="text"
                id="romName"
                value={rom.romName}
                className="input-disabled"
              />
            </div>

            <div className="form-field">
              <label htmlFor="title">Título *</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ingresa el título de la ROM"
                maxLength={MAX_TITLE_LENGTH}
                autoFocus
              />
              <small className="field-hint">
                {title.length}/{MAX_TITLE_LENGTH} caracteres
              </small>
            </div>

            <div className="form-field">
              <label htmlFor="saveFile">Importar Partida Guardada</label>
              <div className="file-select-container">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleSelectSaveFile}
                  disabled={isLoading}
                >
                  Seleccionar archivo .sav
                </button>
                {selectedSaveFile && (
                  <span className="file-name-display">
                    {getFileName(selectedSaveFile)}
                  </span>
                )}
              </div>
              {selectedSaveFile && (
                <button
                  type="button"
                  className="btn btn-info"
                  onClick={handleImportSave}
                  disabled={isLoading}
                  style={{ marginTop: "8px" }}
                >
                  {isLoading ? "Importando..." : "Importar Partida"}
                </button>
              )}
            </div>

            {saveMessage && (
              <div className="success-message">{saveMessage}</div>
            )}
            {error && <div className="error-message">{error}</div>}
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
              {isLoading ? "Guardando..." : BUTTON_LABELS.SAVE}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRomModal;
