import React, { useState, useEffect } from "react";
import "../styles/index.css";
import AppHeader from "./components/layout/AppHeader";
import AppFooter from "./components/layout/AppFooter";
import LoadingState from "./components/layout/LoadingState";
import EmptyState from "./components/layout/EmptyState";
import ConsoleList from "./components/layout/ConsoleList";
import { useRomOperations } from "./hooks/useRomOperations";
import { DEFAULT_SD_PATH } from "./constants/messages";

function App() {
  const [consoles, setConsoles] = useState([]);
  const [sdPath, setSdPath] = useState(DEFAULT_SD_PATH);
  const {
    isLoading,
    handleImportFromSD,
    handleExportToSD,
    handleAddRomFromPC,
  } = useRomOperations();

  useEffect(() => {
    loadConsoles();
  }, []);

  const loadConsoles = async () => {
    const generatedConsoles = await window.electronAPI.getGeneratedConsoles();
    setConsoles(generatedConsoles);
  };

  const totalRoms = consoles.reduce(
    (sum, console) => sum + console.romCount,
    0,
  );

  return (
    <div className="app-container">
      <AppHeader
        sdPath={sdPath}
        onSdPathChange={setSdPath}
        onAddRom={() => handleAddRomFromPC(loadConsoles)}
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
    </div>
  );
}

export default App;
