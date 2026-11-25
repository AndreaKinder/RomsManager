const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getAllRoms: () => ipcRenderer.invoke("get-all-roms"),
  selectRomFile: () => ipcRenderer.invoke("select-rom-file"),
  selectCoverImage: () => ipcRenderer.invoke("select-cover-image"),
  selectSaveFile: () => ipcRenderer.invoke("select-save-file"),
  selectManualPdf: () => ipcRenderer.invoke("select-manual-pdf"),
  selectFolder: () => ipcRenderer.invoke("select-folder"),
  getGeneratedConsoles: () => ipcRenderer.invoke("get-generated-consoles"),
  getAvailableConsoles: () => ipcRenderer.invoke("get-available-consoles"),
  importRomsPC: (sdPath) => ipcRenderer.invoke("import-roms-pc", sdPath),
  importRomsSD: (sdPath) => ipcRenderer.invoke("import-roms-sd", sdPath),
  exportRomsToSD: (sdPath) => ipcRenderer.invoke("export-roms-to-sd", sdPath),
  addRomFromPC: (selectedConsole, romFilePath) =>
    ipcRenderer.invoke("add-rom-from-pc", selectedConsole, romFilePath),
  addSaveFromPC: (romName, consoleId, saveFilePath) =>
    ipcRenderer.invoke("add-save-from-pc", romName, consoleId, saveFilePath),
  addCoverFromPC: (romName, consoleId, coverFilePath) =>
    ipcRenderer.invoke("add-cover-from-pc", romName, consoleId, coverFilePath),
  addManualFromPC: (romName, consoleId, manualFilePath) =>
    ipcRenderer.invoke(
      "add-manual-from-pc",
      romName,
      consoleId,
      manualFilePath,
    ),
  editRomTitle: (romName, newTitle) =>
    ipcRenderer.invoke("edit-rom-title", romName, newTitle),
  editRomName: (romName, newRomName) =>
    ipcRenderer.invoke("edit-rom-name", romName, newRomName),
  deleteRom: (romName) => ipcRenderer.invoke("delete-rom", romName),
  updateRomCollections: (romName, collections) =>
    ipcRenderer.invoke("update-rom-collections", romName, collections),
  exportRomCopy: (sourcePath) =>
    ipcRenderer.invoke("export-rom-copy", sourcePath),
  exportSaveCopy: (sourcePath) =>
    ipcRenderer.invoke("export-save-copy", sourcePath),
  getCollectionObject: (allObjectRoms) =>
    ipcRenderer.invoke("get-collection-object", allObjectRoms),
  getAllCustomCollections: (allObjectRoms) =>
    ipcRenderer.invoke("get-all-custom-collections", allObjectRoms),
  closeApp: () => ipcRenderer.invoke("close-app"),
  enterBigPicture: () => ipcRenderer.invoke("enter-big-picture"),
  exitBigPicture: () => ipcRenderer.invoke("exit-big-picture"),
  getEmulators: () => ipcRenderer.invoke("get-emulators"),
  getEmulatorForConsole: (consoleId) =>
    ipcRenderer.invoke("get-emulator-for-console", consoleId),
  setEmulator: (consoleId, emulatorPathOrConfig, args) =>
    ipcRenderer.invoke("set-emulator", consoleId, emulatorPathOrConfig, args),
  removeEmulator: (consoleId) =>
    ipcRenderer.invoke("remove-emulator", consoleId),
  selectEmulatorFile: () => ipcRenderer.invoke("select-emulator-file"),
  launchRom: (emulatorOrPath, romPath, consoleId) =>
    ipcRenderer.invoke("launch-rom", emulatorOrPath, romPath, consoleId),
  exportBackup: (destinationPath) =>
    ipcRenderer.invoke("export-backup", destinationPath),
  importBackup: (startingDir) =>
    ipcRenderer.invoke("import-backup", startingDir),
  getRomsBasePath: () => ipcRenderer.invoke("get-roms-base-path"),
  hasRomsBasePath: () => ipcRenderer.invoke("has-roms-base-path"),
  romsPathExists: () => ipcRenderer.invoke("roms-path-exists"),
  setRomsBasePath: (basePath) =>
    ipcRenderer.invoke("set-roms-base-path", basePath),
  selectRomsFolder: () => ipcRenderer.invoke("select-roms-folder"),
  getAppConfig: () => ipcRenderer.invoke("get-app-config"),
  setAppConfig: (config) => ipcRenderer.invoke("set-app-config", config),
  getStorageType: () => ipcRenderer.invoke("get-storage-type"),
  setStorageType: (storageType) =>
    ipcRenderer.invoke("set-storage-type", storageType),
  getSyncEmulationStation: () =>
    ipcRenderer.invoke("get-sync-emulation-station"),
  setSyncEmulationStation: (enabled) =>
    ipcRenderer.invoke("set-sync-emulation-station", enabled),
  getDefaultInternalPath: () =>
    ipcRenderer.invoke("get-default-internal-path"),
  syncAllGamelists: () => ipcRenderer.invoke("sync-all-gamelists"),
  syncSystemGamelist: (consoleId) =>
    ipcRenderer.invoke("sync-system-gamelist", consoleId),
  getScraperConfig: () => ipcRenderer.invoke("get-scraper-config"),
  setScraperConfig: (config) => ipcRenderer.invoke("set-scraper-config", config),
  scrapeSearch: (query, consoleId, provider) => ipcRenderer.invoke("scrape-search", query, consoleId, provider),
  scrapeApply: (romName, consoleId, gameData) => ipcRenderer.invoke("scrape-apply", romName, consoleId, gameData),
  getNativeTheme: () => ipcRenderer.invoke("get-native-theme"),
  getPlatform: () => process.platform,
  setThemeSource: (source) => ipcRenderer.invoke("set-theme-source", source),
  onNativeThemeUpdated: (callback) =>
    ipcRenderer.on("native-theme-updated", (_event, data) => callback(data)),
  removeNativeThemeUpdated: () =>
    ipcRenderer.removeAllListeners("native-theme-updated"),
  onWindowMaximized: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on("window-maximized", subscription);
    return () => {
      ipcRenderer.removeListener("window-maximized", subscription);
    };
  },

  // ADB Android Console Sync APIs
  adbGetStatus: () => ipcRenderer.invoke("adb-get-status"),
  adbSelectBinary: () => ipcRenderer.invoke("adb-select-binary"),
  adbSetConfig: (config) => ipcRenderer.invoke("adb-set-config", config),
  adbDownloadInstall: () => ipcRenderer.invoke("adb-download-install"),
  adbListDevices: () => ipcRenderer.invoke("adb-list-devices"),
  adbConnectWireless: (ip, port) => ipcRenderer.invoke("adb-connect-wireless", ip, port),
  adbDisconnectWireless: (target) => ipcRenderer.invoke("adb-disconnect-wireless", target),
  adbGetStoragePaths: (serial) => ipcRenderer.invoke("adb-get-storage-paths", serial),
  adbCompareRoms: (serial, remoteRomsPath) =>
    ipcRenderer.invoke("adb-compare-roms", serial, remoteRomsPath),
  adbExportRoms: (serial, remoteRomsPath, items, options) =>
    ipcRenderer.invoke("adb-export-roms", serial, remoteRomsPath, items, options),
  adbImportRoms: (serial, items) =>
    ipcRenderer.invoke("adb-import-roms", serial, items),
  adbExportSingleRom: (serial, remoteRomsPath, rom, options) =>
    ipcRenderer.invoke("adb-export-single-rom", serial, remoteRomsPath, rom, options),
  onAdbSyncProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on("adb-sync-progress", handler);
    return () => ipcRenderer.removeListener("adb-sync-progress", handler);
  },
  removeAdbSyncProgress: () => ipcRenderer.removeAllListeners("adb-sync-progress"),
  onAdbDownloadProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on("adb-download-progress", handler);
    return () => ipcRenderer.removeListener("adb-download-progress", handler);
  },
  removeAdbDownloadProgress: () => ipcRenderer.removeAllListeners("adb-download-progress"),

  // Path Layout & Library Scanner APIs
  getPathLayout: () => ipcRenderer.invoke("get-path-layout"),
  setPathLayout: (layoutUpdate) => ipcRenderer.invoke("set-path-layout", layoutUpdate),
  scanLocalLibrary: (options) => ipcRenderer.invoke("scan-local-library", options),

  // RomM Integration APIs
  rommGetConfig: () => ipcRenderer.invoke("romm-get-config"),
  rommSetConfig: (config) => ipcRenderer.invoke("romm-set-config", config),
  rommDetectRommSync: () => ipcRenderer.invoke("romm-detect-romm-sync"),
  rommTestConnection: (overrideConfig) => ipcRenderer.invoke("romm-test-connection", overrideConfig),
  rommGetPlatforms: () => ipcRenderer.invoke("romm-get-platforms"),
  rommGetRoms: (query) => ipcRenderer.invoke("romm-get-roms", query),
  rommDownloadRom: (rommRom, targetConsoleId) =>
    ipcRenderer.invoke("romm-download-rom", rommRom, targetConsoleId),
  rommSyncMetadata: () => ipcRenderer.invoke("romm-sync-metadata"),
  rommDownloadSave: (rommId, consoleId, romFileName) =>
    ipcRenderer.invoke("romm-download-save", rommId, consoleId, romFileName),
  rommUploadSave: (rommId, saveFilePath, emulatorName) =>
    ipcRenderer.invoke("romm-upload-save", rommId, saveFilePath, emulatorName),
  onRommDownloadProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on("romm-download-progress", handler);
    return () => ipcRenderer.removeListener("romm-download-progress", handler);
  },
});
