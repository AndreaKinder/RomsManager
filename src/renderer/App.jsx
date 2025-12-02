import React, { useState, useEffect } from "react";
import "nes.css/css/nes.min.css";
import "../styles/index.css";
import ConsoleCollection from "./components/roms/ConsoleCollection";
import SyncModal from "./components/modals/SyncModal";

function App() {
  const [consoles, setConsoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [sdPath, setSdPath] = useState("D:/");

  useEffect(() => {
    loadConsoles();
  }, []);

  const loadConsoles = async () => {
    setIsLoading(true);
    const generatedConsoles = await window.electronAPI.getGeneratedConsoles();
    setConsoles(generatedConsoles);
    setIsLoading(false);
  };

  const handleSyncRoms = async (systemId, drivePath) => {
    const result = await window.electronAPI.syncRoms({ systemId, drivePath });
    await loadConsoles();
    return result;
  };

  const handleImportFromPC = async () => {
    if (isLoading) return;

    const confirmed = window.confirm(
      `¿Desea importar las ROMs desde ${sdPath} al PC?`,
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const result = await window.electronAPI.importRomsPC(sdPath);
      if (result.success) {
        alert("ROMs importadas exitosamente desde PC!");
        await loadConsoles();
      } else {
        alert(
          "Error al importar ROMs: " + (result.error || "Error desconocido"),
        );
      }
    } catch (error) {
      alert("Error al importar ROMs: " + error.message);
    }
    setIsLoading(false);
  };

  const handleImportFromSD = async () => {
    if (isLoading) return;

    const confirmed = window.confirm(
      `¿Desea importar las ROMs desde la SD (${sdPath}) al PC?`,
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const result = await window.electronAPI.importRomsSD(sdPath);
      if (result.success) {
        alert("ROMs importadas exitosamente desde SD!");
        await loadConsoles();
      } else {
        alert(
          "Error al importar ROMs: " + (result.error || "Error desconocido"),
        );
      }
    } catch (error) {
      alert("Error al importar ROMs: " + error.message);
    }
    setIsLoading(false);
  };

  const totalRoms = consoles.reduce(
    (sum, console) => sum + console.romCount,
    0,
  );

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="nes-text is-primary">
          <i className="nes-icon trophy is-medium"></i>
          ROM Manager
        </h1>
        <div className="sd-path-input">
          <label className="nes-text">SD Path:</label>
          <input
            type="text"
            className="nes-input"
            value={sdPath}
            onChange={(e) => setSdPath(e.target.value)}
            placeholder="D:/"
            style={{ width: "150px" }}
          />
        </div>
        <div className="header-actions">
          <button
            className="nes-btn is-success"
            onClick={handleImportFromPC}
            disabled={isLoading}
          >
            Import from PC
          </button>
          <button
            className="nes-btn is-primary"
            onClick={handleImportFromSD}
            disabled={isLoading}
          >
            Import from SD
          </button>
          <button
            className="nes-btn is-warning"
            onClick={() => setIsSyncModalOpen(true)}
          >
            Sync ROMs
          </button>
          <button className="nes-btn" onClick={loadConsoles}>
            Refresh
          </button>
        </div>
      </header>

      <main className="app-content">
        {isLoading && (
          <div className="loading-container">
            <p className="nes-text">Loading...</p>
          </div>
        )}

        {!isLoading && consoles.length === 0 && (
          <div className="empty-state">
            <div className="nes-container is-rounded">
              <p className="nes-text is-primary">No ROM collections found!</p>
              <p className="nes-text">
                Click "Sync ROMs" to import your ROMs from SD card.
              </p>
            </div>
          </div>
        )}

        {!isLoading && consoles.length > 0 && (
          <div className="consoles-container">
            {consoles.map((console) => (
              <ConsoleCollection key={console.consoleId} console={console} />
            ))}
          </div>
        )}

        <SyncModal
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
          onSync={handleSyncRoms}
        />
      </main>

      <footer className="app-footer">
        <p className="nes-text is-disabled">
          Total Consoles: {consoles.length} | Total ROMs: {totalRoms}
        </p>
      </footer>
    </div>
  );
}

export default App;
