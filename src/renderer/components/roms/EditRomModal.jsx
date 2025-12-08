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

  const handleBackdropClick = (e) => {
    if (e.target.className === "modal-backdrop") {
      onClose();
    }
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
                disabled
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
