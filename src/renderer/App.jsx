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
  const [customCollections, setCustomCollections] = useState([]);
  const [isCustomCollectionView, setIsCustomCollectionView] = useState(false);
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

  const loadCustomCollections = useCallback(async () => {
    try {
      setError(null);
      const allRoms = await window.electronAPI.getAllRoms();

      // Procesar todas las ROMs para extraer colecciones únicas
      const collectionsMap = {};

      // Iterar sobre cada consola
      Object.keys(allRoms).forEach((consoleId) => {
        const roms = allRoms[consoleId];

        // Iterar sobre cada ROM
        roms.forEach((rom) => {
          // Verificar si la ROM tiene el campo 'collections' (array)
          if (rom.collections && Array.isArray(rom.collections)) {
            rom.collections.forEach((collectionName) => {
              if (!collectionsMap[collectionName]) {
                collectionsMap[collectionName] = {
                  collectionName,
                  roms: [],
                  romCount: 0,
                };
              }
              collectionsMap[collectionName].roms.push(rom);
              collectionsMap[collectionName].romCount++;
            });
          }
        });
      });

      // Convertir el mapa a un array
      const collections = Object.values(collectionsMap);
      setCustomCollections(collections);
    } catch (err) {
      const errorMessage = ERROR_MESSAGES.LOAD_CONSOLES(
        err.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      );
      setError(errorMessage);
      console.error("Failed to load custom collections:", err);
      alert(errorMessage);
    }
  }, []);

  useEffect(() => {
    loadConsoles();
    loadCustomCollections();
  }, [loadConsoles, loadCustomCollections]);

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

  // Filter custom collections based on search query
  const filteredCustomCollections = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return customCollections;
    }

    const query = searchQuery.toLowerCase().trim();

    return customCollections
      .map((collection) => {
        const romsArray = Array.isArray(collection.roms)
          ? collection.roms
          : Object.values(collection.roms || {});

        const filteredRoms = romsArray.filter(
          (rom) =>
            rom.title?.toLowerCase().includes(query) ||
            rom.romName?.toLowerCase().includes(query),
        );

        return {
          ...collection,
          roms: filteredRoms,
          romCount: filteredRoms.length,
        };
      })
      .filter((collection) => collection.romCount > 0);
  }, [customCollections, searchQuery]);

  const totalRoms = isCustomCollectionView
    ? customCollections.reduce(
        (sum, collection) => sum + collection.roms.length,
        0,
      )
    : consoles.reduce((sum, console) => sum + console.romCount, 0);

  const filteredRomsCount = isCustomCollectionView
    ? filteredCustomCollections.reduce(
        (sum, collection) => sum + collection.romCount,
        0,
      )
    : filteredConsoles.reduce((sum, console) => sum + console.romCount, 0);

  const totalConsoleCount = isCustomCollectionView
    ? customCollections.length
    : consoles.length;

  const handleConsoleSelected = async (selectedConsole, romFilePath) => {
    setShowConsoleModal(false);
    await handleAddRomFromPC(selectedConsole, romFilePath, loadConsoles);
  };

  return (
    <div className="app-container">
      <AppHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddRom={() => setShowConsoleModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        isLoading={isLoading}
        onOpenCustomCollectionSelect={() =>
          setIsCustomCollectionView(!isCustomCollectionView)
        }
        onOpenCustomCollectionSelected={isCustomCollectionView}
      />

      <main className="app-content">
        {isLoading && <LoadingState />}
        {!isLoading && !isCustomCollectionView && consoles.length === 0 && (
          <EmptyState />
        )}
        {!isLoading &&
          isCustomCollectionView &&
          customCollections.length === 0 && (
            <div className="empty-state">
              <p className="empty-message">No hay colecciones personalizadas</p>
              <p className="empty-hint">
                Las colecciones se crean automáticamente cuando las ROMs tienen
                el campo "collections" en su JSON
              </p>
            </div>
          )}
        {!isLoading &&
          ((isCustomCollectionView &&
            customCollections.length > 0 &&
            filteredCustomCollections.length === 0) ||
            (!isCustomCollectionView &&
              consoles.length > 0 &&
              filteredConsoles.length === 0)) &&
          searchQuery && (
            <div className="empty-state">
              <p className="empty-message">{UI_TEXT.NO_SEARCH_RESULTS}</p>
              <p className="empty-hint">Intenta con otro término de búsqueda</p>
            </div>
          )}
        {!isLoading &&
          !isCustomCollectionView &&
          consoles.length > 0 &&
          filteredConsoles.length > 0 && (
            <ConsoleList
              consoles={filteredConsoles}
              onRomUpdated={loadConsoles}
            />
          )}
        {!isLoading &&
          isCustomCollectionView &&
          customCollections.length > 0 &&
          filteredCustomCollections.length > 0 && (
            <ConsoleList
              consoles={filteredCustomCollections}
              onRomUpdated={loadCustomCollections}
              isCustomCollection={true}
            />
          )}
      </main>

      <AppFooter
        totalConsoles={totalConsoleCount}
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
