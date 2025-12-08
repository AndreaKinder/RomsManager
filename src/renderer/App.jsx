import React, { useState, useEffect, useCallback } from "react";
import "../styles/index.css";
import AppHeader from "./components/layout/AppHeader";
import AppFooter from "./components/layout/AppFooter";
import LoadingState from "./components/layout/LoadingState";
import EmptyState from "./components/layout/EmptyState";
import ConsoleList from "./components/layout/ConsoleList";
import SelectConsoleModal from "./components/roms/SelectConsoleModal";
import { useRomOperations } from "./hooks/useRomOperations";
import { DEFAULT_SD_PATH, ERROR_MESSAGES } from "./constants/messages";

function App() {
  const [consoles, setConsoles] = useState([]);
  const [sdPath, setSdPath] = useState(DEFAULT_SD_PATH);
  const [showConsoleModal, setShowConsoleModal] = useState(false);
  const [error, setError] = useState(null);
  const {
    isLoading,
    handleImportFromSD,
    handleExportToSD,
    handleAddRomFromPC,
  } = useRomOperations();

  const loadConsoles = useCallback(async () => {
    try {
      setError(null);
      const generatedConsoles = await window.electronAPI.getGeneratedConsoles();
      setConsoles(generatedConsoles);
    } catch (err) {
      const errorMessage = ERROR_MESSAGES.LOAD_CONSOLES(
        err.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      );
      setError(errorMessage);
      console.error("Failed to load consoles:", err);
      alert(errorMessage);
    }
  }, []);

  useEffect(() => {
    loadConsoles();
  }, [loadConsoles]);

  const totalRoms = consoles.reduce(
    (sum, console) => sum + console.romCount,
    0,
  );

  const handleConsoleSelected = async (selectedConsole, romFilePath) => {
    setShowConsoleModal(false);
    await handleAddRomFromPC(selectedConsole, romFilePath, loadConsoles);
  };

  return (
    <div className="app-container">
      <AppHeader
        sdPath={sdPath}
        onSdPathChange={setSdPath}
        onAddRom={() => setShowConsoleModal(true)}
        onImportFromSD={() => handleImportFromSD(sdPath, loadConsoles)}
        onExportToSD={() => handleExportToSD(sdPath)}
        onRefresh={loadConsoles}
        isLoading={isLoading}
      />

      <main className="app-content">
        {isLoading && <LoadingState />}
        {!isLoading && consoles.length === 0 && <EmptyState />}
        {!isLoading && consoles.length > 0 && (
          <ConsoleList consoles={consoles} onRomUpdated={loadConsoles} />
        )}
      </main>

      <AppFooter totalConsoles={consoles.length} totalRoms={totalRoms} />

      {showConsoleModal && (
        <SelectConsoleModal
          onClose={() => setShowConsoleModal(false)}
          onSelect={handleConsoleSelected}
        />
      )}
    </div>
  );
}

export default App;
