import React, { useState, useEffect, useCallback } from "react";
import "../styles/index.css";
import AppHeader from "./components/layout/AppHeader";
import AppFooter from "./components/layout/AppFooter";
import LoadingState from "./components/layout/LoadingState";
import EmptyState from "./components/layout/EmptyState";
import ConsoleList from "./components/layout/ConsoleList";
import SelectConsoleModal from "./components/roms/SelectConsoleModal";
import SettingsModal from "./components/layout/SettingsModal";
import FirstRunModal from "./components/layout/FirstRunModal";
import PathMissingModal from "./components/layout/PathMissingModal";
import BigPictureView from "./components/bigpicture/BigPictureView";
import { useRomOperations } from "./hooks/useRomOperations";
import { ERROR_MESSAGES, UI_TEXT } from "./constants/messages";
import { getDisplacementFilter } from "./utils/liquidGlass";

function App() {
  const [consoles, setConsoles] = useState([]);
  const [customCollections, setCustomCollections] = useState([]);
  const [isCustomCollectionView, setIsCustomCollectionView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConsoleModal, setShowConsoleModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFirstRunModal, setShowFirstRunModal] = useState(false);
  const [showPathMissingModal, setShowPathMissingModal] = useState(false);
  const [missingPath, setMissingPath] = useState("");
  const [isCheckingFirstRun, setIsCheckingFirstRun] = useState(true);
  const [error, setError] = useState(null);
  const [isBigPictureMode, setIsBigPictureMode] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const { isLoading, handleAddRomFromPC } = useRomOperations();

  useEffect(() => {
    (async () => {
      const { isDark } = await window.electronAPI.getNativeTheme();
      document.documentElement.setAttribute(
        "data-theme",
        isDark ? "dark" : "light",
      );

      // Detect macOS platform to enable liquid-glass theme
      try {
        const platform = await window.electronAPI.getPlatform();
        if (platform === "darwin") {
          setIsMac(true);
          document.documentElement.classList.add("theme-liquid-glass");
        }
      } catch (err) {
        console.error("Failed to detect platform:", err);
      }
    })();

    const handleThemeUpdate = ({ isDark }) => {
      document.documentElement.setAttribute(
        "data-theme",
        isDark ? "dark" : "light",
      );
    };

    window.electronAPI.onNativeThemeUpdated(handleThemeUpdate);

    let unsubscribeMaximized = null;
    if (window.electronAPI.onWindowMaximized) {
      unsubscribeMaximized = window.electronAPI.onWindowMaximized((isMaximized) => {
        if (isMaximized) {
          document.documentElement.classList.add("maximized");
        } else {
          document.documentElement.classList.remove("maximized");
        }
      });
    }

    return () => {
      window.electronAPI.removeNativeThemeUpdated();
      if (unsubscribeMaximized) unsubscribeMaximized();
    };
  }, []);

  // Apply Liquid Glass dynamic refraction effect (SVG displacement filter) on macOS
  useEffect(() => {
    if (!isMac) return;

    const resizeObservers = [];

    const updateGlass = (el) => {
      const rect = el.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (width === 0 || height === 0) return;

      // Configure premium parameters based on the element type or defaults
      let blur = 12;
      let depth = 8;
      let strength = 35;
      let cab = 4;
      let saturate = 1.45;
      let brightness = 1.15;

      if (el.classList.contains("btn")) {
        blur = 4;
        depth = 4;
        strength = 20;
        cab = 2;
        saturate = 1.25;
        brightness = 1.35;
      } else if (el.classList.contains("rom-card")) {
        blur = 16;
        depth = 12;
        strength = 45;
        cab = 5;
        saturate = 1.6;
        brightness = 1.1;
      } else if (el.classList.contains("modal-content")) {
        blur = 20;
        depth = 14;
        strength = 50;
        cab = 6;
        saturate = 1.5;
        brightness = 1.1;
      }

      // Read border-radius to align displacement perfectly
      const computedStyle = window.getComputedStyle(el);
      const radius = parseFloat(computedStyle.borderRadius) || 12;

      const filterUrl = getDisplacementFilter({
        height,
        width,
        radius,
        depth,
        strength,
        chromaticAberration: cab,
      });

      el.style.backdropFilter = `blur(${blur / 2}px) url('${filterUrl}') blur(${blur}px) brightness(${brightness}) saturate(${saturate})`;
    };

    const initGlassEffect = () => {
      const elements = document.querySelectorAll(
        ".theme-liquid-glass .app-header, " +
        ".theme-liquid-glass .app-content, " +
        ".theme-liquid-glass .app-footer, " +
        ".theme-liquid-glass .console-header, " +
        ".theme-liquid-glass .rom-card, " +
        ".theme-liquid-glass .modal-content, " +
        ".theme-liquid-glass .btn:not(.btn-danger):not(.btn-success)"
      );

      elements.forEach((el) => {
        if (el.dataset.glassObserved) return;
        el.dataset.glassObserved = "true";

        // Initial apply
        updateGlass(el);

        // Observe resize events to recalculate displacement SVG dimensions dynamically
        const ro = new ResizeObserver(() => {
          updateGlass(el);
        });
        ro.observe(el);
        resizeObservers.push(ro);
      });
    };

    // Run initially
    initGlassEffect();

    // Use MutationObserver to catch newly loaded ROM cards, modals, custom collections, etc.
    const observer = new MutationObserver(() => {
      initGlassEffect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      resizeObservers.forEach((ro) => ro.disconnect());
    };
  }, [isMac]);

  useEffect(() => {
    (async () => {
      const hasPath = await window.electronAPI.hasRomsBasePath();
      if (!hasPath) {
        setShowFirstRunModal(true);
      } else {
        const exists = await window.electronAPI.romsPathExists();
        if (!exists) {
          const currentPath = await window.electronAPI.getRomsBasePath();
          setMissingPath(currentPath);
          setShowPathMissingModal(true);
        }
      }
      setIsCheckingFirstRun(false);
    })();
  }, []);

  const handleFirstRunComplete = useCallback(() => {
    setShowFirstRunModal(false);
    loadConsoles();
    loadCustomCollections();
  }, []);

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
    if (!isCheckingFirstRun && !showFirstRunModal) {
      loadConsoles();
      loadCustomCollections();
    }
  }, [isCheckingFirstRun, showFirstRunModal, loadConsoles, loadCustomCollections]);

  const enterBigPicture = useCallback(async () => {
    await window.electronAPI.enterBigPicture();
    setIsBigPictureMode(true);
  }, []);

  const exitBigPicture = useCallback(async () => {
    await window.electronAPI.exitBigPicture();
    setIsBigPictureMode(false);
  }, []);

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
  const totalCollectionCount = isCustomCollectionView
    ? customCollections.length
    : consoles.length;

  const handleConsoleSelected = async (selectedConsole, romFilePath) => {
    setShowConsoleModal(false);
    await handleAddRomFromPC(selectedConsole, romFilePath, loadConsoles);
  };

  if (isCheckingFirstRun) return null;

  if (showFirstRunModal) {
    return <FirstRunModal onComplete={handleFirstRunComplete} />;
  }

  if (showPathMissingModal) {
    return (
      <PathMissingModal
        missingPath={missingPath}
        onClose={() => window.electronAPI.closeApp()}
        onChangeRoute={() => {
          setShowPathMissingModal(false);
          setShowFirstRunModal(true);
        }}
      />
    );
  }

  if (isBigPictureMode) {
    const bpConsoles = isCustomCollectionView ? customCollections : consoles;
    return <BigPictureView consoles={bpConsoles} onExit={exitBigPicture} />;
  }

  return (
    <>
      {isMac && (
        <div className="liquid-glass-bg">
          <div className="bg-blob blob-1"></div>
          <div className="bg-blob blob-2"></div>
          <div className="bg-blob blob-3"></div>
          <div className="bg-blob blob-4"></div>
        </div>
      )}
      <div className="app-container">
        <AppHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddRom={() => setShowConsoleModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onEnterBigPicture={enterBigPicture}
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
          customCollectionSelected={isCustomCollectionView}
          totalCollections={totalCollectionCount}
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
    </>
  );
}

export default App;
