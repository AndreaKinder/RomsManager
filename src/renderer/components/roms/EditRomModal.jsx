import React, { useState, useEffect } from "react";
import {
  VALIDATION_MESSAGES,
  ERROR_MESSAGES,
  BUTTON_LABELS,
  MAX_TITLE_LENGTH,
} from "../../constants/messages";
import { IconX } from "@tabler/icons-react";

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
  const [scrapeResults, setScrapeResults] = useState([]);
  const [isScraping, setIsScraping] = useState(false);
  const [showScrapeResults, setShowScrapeResults] = useState(false);
  const [scraperProvider, setScraperProvider] = useState("screenscraper");

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

    const loadScraperConfig = async () => {
      try {
        if (window.electronAPI.getScraperConfig) {
          const config = await window.electronAPI.getScraperConfig();
          setScraperProvider(config.defaultScraper || "screenscraper");
        }
      } catch (error) {
        console.error("Error loading scraper config:", error);
      }
    };

    loadCollections();
    loadScraperConfig();
  }, []);

  const handleSelectChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setSelectedCollections(selectedOptions);
  };

  const handleScrapeSearch = async () => {
    if (!title.trim()) {
      setError("Ingresa un título para buscar");
      return;
    }

    setIsScraping(true);
    setError(null);
    setScrapeResults([]);
    setShowScrapeResults(true);

    try {
      const response = await window.electronAPI.scrapeSearch(title, rom.system, scraperProvider);
      if (response.success) {
        setScrapeResults(response.results || []);
        if (response.results?.length === 0) {
          setError("No se encontraron resultados");
        }
      } else {
        setError(response.error || "Error al buscar metadatos");
      }
    } catch (err) {
      setError("Error de conexión al buscar: " + err.message);
    } finally {
      setIsScraping(false);
    }
  };

  const handleScrapeApply = async (gameData) => {
    setIsLoading(true);
    setError(null);
    setShowScrapeResults(false);

    try {
      const response = await window.electronAPI.scrapeApply(rom.romName, rom.system, gameData);
      
      if (response.success) {
        setCoverMessage(`Metadatos y carátula aplicados exitosamente.`);
        if (gameData.title) setTitle(gameData.title);
        // Podríamos también actualizar localmente rom.description, etc si los mostramos, 
        // pero principalmente disparamos onSave() al final de guardar todo de todas formas.
      } else {
        setError(response.error || "Error al aplicar los metadatos");
      }
    } catch (err) {
      setError("Error de conexión al aplicar: " + err.message);
    } finally {
      setIsLoading(false);
    }
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
            <IconX size={20} />
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
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
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
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleScrapeSearch}
                  disabled={isLoading || isScraping || !title.trim()}
                  title="Buscar Metadatos"
                >
                  🔍 Buscar
                </button>
              </div>

              {showScrapeResults && (
                <div style={{ 
                  marginTop: "10px", 
                  padding: "10px", 
                  background: "var(--bg-secondary, #2a2a2a)", 
                  border: "1px solid var(--border-color, #444)", 
                  borderRadius: "6px",
                  maxHeight: "300px",
                  overflowY: "auto"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontWeight: "bold" }}>Resultados de la búsqueda:</span>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <select 
                        value={scraperProvider}
                        onChange={(e) => setScraperProvider(e.target.value)}
                        style={{ padding: "2px 4px", fontSize: "12px" }}
                        disabled={isScraping}
                      >
                        <option value="screenscraper">ScreenScraper</option>
                        <option value="thegamesdb">TheGamesDB</option>
                      </select>
                      <button 
                        type="button" 
                        onClick={() => setShowScrapeResults(false)}
                        style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "16px" }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {isScraping ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>Buscando...</div>
                  ) : scrapeResults.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "var(--text-secondary)" }}>
                      No se encontraron resultados
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {scrapeResults.map((result) => (
                        <div 
                          key={result.id} 
                          style={{ 
                            display: "flex", 
                            gap: "10px", 
                            padding: "8px", 
                            background: "rgba(0,0,0,0.2)", 
                            borderRadius: "4px",
                            alignItems: "center"
                          }}
                        >
                          <div style={{ width: "50px", height: "70px", backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                            {result.coverUrl ? (
                              <img src={result.coverUrl} alt="Cover" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                            ) : (
                              <span style={{ fontSize: "10px", color: "#666" }}>No img</span>
                            )}
                          </div>
                          <div style={{ flex: 1, overflow: "hidden" }}>
                            <div style={{ fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{result.title}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                              {result.developer && <span>{result.developer}</span>}
                              {result.developer && result.releaseDate && <span> • </span>}
                              {result.releaseDate && <span>{result.releaseDate}</span>}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleScrapeApply(result)}
                            disabled={isLoading}
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                          >
                            Aplicar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
