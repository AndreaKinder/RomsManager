import React, { useState, useEffect } from "react";
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
  const [selectedCoverFile, setSelectedCoverFile] = useState(null);
  const [coverMessage, setCoverMessage] = useState(null);
  const [selectedManualFile, setSelectedManualFile] = useState(null);
  const [manualMessage, setManualMessage] = useState(null);
  const [selectedCollections, setSelectedCollections] = useState(
    rom.collections || [],
  );
  const [availableCollections, setAvailableCollections] = useState([]);

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

        setAvailableCollections(allUniqueCollections);
      } catch (error) {
        console.error("Error loading collections:", error);
        const saved = localStorage.getItem("customCollections");
        const localCollections = saved ? JSON.parse(saved) : [];
        setAvailableCollections(localCollections);
      }
    };

    loadCollections();
  }, []);

  const handleSelectChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setSelectedCollections(selectedOptions);
  };

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
        const newRomName = `${title}.${fileExtension}`;

        await window.electronAPI.editRomName(rom.romName, newRomName);

        // Actualizar colecciones
        await window.electronAPI.updateRomCollections(
          newRomName,
          selectedCollections,
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

  const handleSelectCoverFile = async () => {
    try {
      const filePath = await window.electronAPI.selectCoverImage();
      if (filePath) {
        setSelectedCoverFile(filePath);
        setError(null);
        setCoverMessage(null);
      }
    } catch (err) {
      setError(ERROR_MESSAGES.SELECT_FILE(err.message));
    }
  };

  const handleSelectManualFile = async () => {
    try {
      const filePath = await window.electronAPI.selectManualPdf();
      if (filePath) {
        setSelectedManualFile(filePath);
        setError(null);
        setManualMessage(null);
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

  const handleImportCover = async () => {
    if (!selectedCoverFile) {
      setError("Por favor selecciona una imagen primero");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCoverMessage(null);

    try {
      const result = await window.electronAPI.addCoverFromPC(
        rom.romName,
        rom.system,
        selectedCoverFile,
      );

      if (result.success) {
        setCoverMessage(
          `Carátula importada exitosamente para ${result.romName}`,
        );
        setSelectedCoverFile(null);
      } else {
        setError(result.error || ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    } catch (err) {
      setError(ERROR_MESSAGES.CONNECTION_ERROR(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportManual = async () => {
    if (!selectedManualFile) {
      setError("Por favor selecciona un archivo PDF primero");
      return;
    }

    setIsLoading(true);
    setError(null);
    setManualMessage(null);

    try {
      const result = await window.electronAPI.addManualFromPC(
        rom.romName,
        rom.system,
        selectedManualFile,
      );

      if (result.success) {
        setManualMessage(
          `Manual importado exitosamente para ${result.romName}`,
        );
        setSelectedManualFile(null);
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
                readOnly
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
              <label htmlFor="collections">Colecciones Personalizadas</label>

              {availableCollections.length > 0 ? (
                <>
                  <select
                    id="collections"
                    multiple
                    value={selectedCollections}
                    onChange={handleSelectChange}
                    disabled={isLoading}
                    className="collections-select"
                    size="5"
                  >
                    {availableCollections.map((collection) => (
                      <option key={collection} value={collection}>
                        {collection}
                      </option>
                    ))}
                  </select>
                  <p className="form-hint">
                    Mantén presionado Ctrl (Cmd en Mac) para seleccionar
                    múltiples colecciones. Las colecciones se gestionan desde
                    Configuración ⚙️.
                  </p>
                </>
              ) : (
                <p className="form-hint">
                  No hay colecciones disponibles. Añade colecciones desde
                  Configuración ⚙️.
                </p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="coverFile">Importar Carátula</label>
              <div className="file-select-container">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleSelectCoverFile}
                  disabled={isLoading}
                >
                  Seleccionar imagen
                </button>
                {selectedCoverFile && (
                  <span className="file-name-display">
                    {getFileName(selectedCoverFile)}
                  </span>
                )}
              </div>
              {selectedCoverFile && (
                <button
                  type="button"
                  className="btn btn-info"
                  onClick={handleImportCover}
                  disabled={isLoading}
                  style={{ marginTop: "8px" }}
                >
                  {isLoading ? "Importando..." : "Importar Carátula"}
                </button>
              )}
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

            <div className="form-field">
              <label htmlFor="manualFile">Importar Manual (PDF)</label>
              <div className="file-select-container">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleSelectManualFile}
                  disabled={isLoading}
                >
                  Seleccionar archivo PDF
                </button>
                {selectedManualFile && (
                  <span className="file-name-display">
                    {getFileName(selectedManualFile)}
                  </span>
                )}
              </div>
              {selectedManualFile && (
                <button
                  type="button"
                  className="btn btn-info"
                  onClick={handleImportManual}
                  disabled={isLoading}
                  style={{ marginTop: "8px" }}
                >
                  {isLoading ? "Importando..." : "Importar Manual"}
                </button>
              )}
            </div>

            {coverMessage && (
              <div className="success-message">{coverMessage}</div>
            )}
            {saveMessage && (
              <div className="success-message">{saveMessage}</div>
            )}
            {manualMessage && (
              <div className="success-message">{manualMessage}</div>
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
