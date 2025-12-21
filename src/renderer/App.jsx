import React, { useState, useEffect, useCallback } from "react";
import "../styles/index.css";
import AppHeader from "./components/layout/AppHeader";
import AppFooter from "./components/layout/AppFooter";
import LoadingState from "./components/layout/LoadingState";
import EmptyState from "./components/layout/EmptyState";
import ConsoleList from "./components/layout/ConsoleList";
import SelectConsoleModal from "./components/roms/SelectConsoleModal";
import SettingsModal from "./components/layout/SettingsModal";
import { useRomOperations } from "./hooks/useRomOperations";
import { DEFAULT_SD_PATH, ERROR_MESSAGES, UI_TEXT } from "./constants/messages";

function App() {
  const [consoles, setConsoles] = useState([]);
  const [sdPath, setSdPath] = useState(DEFAULT_SD_PATH);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConsoleModal, setShowConsoleModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
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

  // Filter consoles and ROMs based on search query
  const filteredConsoles = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return consoles;
    }

    const query = searchQuery.toLowerCase().trim();

    return consoles
      .map((console) => {
        const romsArray = Array.isArray(console.roms)
          ? console.roms
          : Object.values(console.roms || {});

        const filteredRoms = romsArray.filter(
          (rom) =>
            rom.title?.toLowerCase().includes(query) ||
            rom.romName?.toLowerCase().includes(query),
        );

        return {
          ...console,
          roms: filteredRoms,
          romCount: filteredRoms.length,
          originalRomCount: console.romCount,
        };
      })
      .filter((console) => console.romCount > 0);
  }, [consoles, searchQuery]);

  const totalRoms = consoles.reduce(
    (sum, console) => sum + console.romCount,
    0,
  );

  const filteredRomsCount = filteredConsoles.reduce(
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
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddRom={() => setShowConsoleModal(true)}
        onImportFromSD={() => handleImportFromSD(sdPath, loadConsoles)}
        onExportToSD={() => handleExportToSD(sdPath)}
        onRefresh={loadConsoles}
        onOpenSettings={() => setShowSettingsModal(true)}
        isLoading={isLoading}
      />

      <main className="app-content">
        {isLoading && <LoadingState />}
        {!isLoading && consoles.length === 0 && <EmptyState />}
        {!isLoading &&
          consoles.length > 0 &&
          filteredConsoles.length === 0 &&
          searchQuery && (
            <div className="empty-state">
              <p className="empty-message">{UI_TEXT.NO_SEARCH_RESULTS}</p>
              <p className="empty-hint">Intenta con otro término de búsqueda</p>
            </div>
          )}
        {!isLoading && consoles.length > 0 && filteredConsoles.length > 0 && (
          <ConsoleList
            consoles={filteredConsoles}
            onRomUpdated={loadConsoles}
          />
        )}
      </main>

      <AppFooter
        totalConsoles={consoles.length}
        totalRoms={totalRoms}
        filteredRomsCount={searchQuery ? filteredRomsCount : null}
      />

      {showConsoleModal && (
        <SelectConsoleModal
          onClose={() => setShowConsoleModal(false)}
          onSelect={handleConsoleSelected}
        />
      )}

      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </div>
  );
}

export default App;
