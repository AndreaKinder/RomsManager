import React, { useState, useEffect } from "react";
import {
  ERROR_MESSAGES,
  VALIDATION_MESSAGES,
  BUTTON_LABELS,
} from "../../constants/messages";
import { IconX } from "@tabler/icons-react";

function SelectConsoleModal({ onClose, onSelect, isInline = false }) {
  const [consoles, setConsoles] = useState([]);
  const [selectedConsole, setSelectedConsole] = useState("");
  const [selectedRomFile, setSelectedRomFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConsoles();
  }, []);

  const loadConsoles = async () => {
    try {
      const availableConsoles = await window.electronAPI.getAvailableConsoles();
      setConsoles(availableConsoles);
      setIsLoading(false);
    } catch (err) {
      setError(ERROR_MESSAGES.LOAD_CONSOLES(err.message));
      setIsLoading(false);
    }
  };

  const handleSelectRomFile = async () => {
    try {
      const filePath = await window.electronAPI.selectRomFile();
      if (filePath) {
        setSelectedRomFile(filePath);
        setError(null);
      }
    } catch (err) {
      setError(ERROR_MESSAGES.SELECT_FILE(err.message));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedConsole) {
      setError(VALIDATION_MESSAGES.SELECT_CONSOLE);
      return;
    }

    if (!selectedRomFile) {
      setError(VALIDATION_MESSAGES.SELECT_ROM_FILE);
      return;
    }

    onSelect(selectedConsole, selectedRomFile);
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
    <div 
      className={isInline ? "inline-view-content" : "modal-backdrop"} 
      onClick={isInline ? undefined : handleBackdropClick}
    >
      <div className={isInline ? "" : "modal-content"}>
        <div className={isInline ? "inline-view-header" : "modal-header"}>
          <h2>Agregar ROM desde PC</h2>
          {!isInline && (
            <button className="modal-close-btn" onClick={onClose}>
              <IconX size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className={isInline ? "inline-view-body" : "modal-body"}>
            <div className="form-field">
              <label htmlFor="console">Consola *</label>
              {isLoading ? (
                <p>Cargando consolas...</p>
              ) : (
                <select
                  id="console"
                  value={selectedConsole}
                  onChange={(e) => setSelectedConsole(e.target.value)}
                  autoFocus
                >
                  <option value="">-- Selecciona una consola --</option>
                  {consoles.map((console) => (
                    <option key={console.id} value={console.id}>
                      {console.name} ({console.extensions.join(", ")})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="romFile">Archivo ROM *</label>
              <div className="file-select-container">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleSelectRomFile}
                  disabled={isLoading}
                >
                  Seleccionar archivo...
                </button>
                {selectedRomFile && (
                  <span className="file-name-display">
                    {getFileName(selectedRomFile)}
                  </span>
                )}
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>

          <div className={isInline ? "inline-view-footer" : "modal-footer"}>
            {!isInline && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                {BUTTON_LABELS.CANCEL}
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !selectedConsole || !selectedRomFile}
            >
              Agregar ROM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SelectConsoleModal;
