const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getAllRoms: () => ipcRenderer.invoke("get-all-roms"),
  getRom: (id) => ipcRenderer.invoke("get-rom", id),
  createRom: (romData) => ipcRenderer.invoke("create-rom", romData),
  updateRom: (id, updates) => ipcRenderer.invoke("update-rom", id, updates),
  deleteRom: (id) => ipcRenderer.invoke("delete-rom", id),
  selectRomFile: () => ipcRenderer.invoke("select-rom-file"),
  selectCoverImage: () => ipcRenderer.invoke("select-cover-image"),
  selectSaveFile: () => ipcRenderer.invoke("select-save-file"),
  selectManualPdf: () => ipcRenderer.invoke("select-manual-pdf"),
  selectFolder: () => ipcRenderer.invoke("select-folder"),
  exportToSD: (data) => ipcRenderer.invoke("export-to-sd", data),
  importFromSD: (data) => ipcRenderer.invoke("import-from-sd", data),
  syncRoms: (data) => ipcRenderer.invoke("sync-roms", data),
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
  setEmulator: (consoleId, emulatorPath) =>
    ipcRenderer.invoke("set-emulator", consoleId, emulatorPath),
  removeEmulator: (consoleId) =>
    ipcRenderer.invoke("remove-emulator", consoleId),
  selectEmulatorFile: () => ipcRenderer.invoke("select-emulator-file"),
  launchRom: (emulatorPath, romPath) =>
    ipcRenderer.invoke("launch-rom", emulatorPath, romPath),
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
  getNativeTheme: () => ipcRenderer.invoke("get-native-theme"),
  getPlatform: () => process.platform,
  setThemeSource: (source) => ipcRenderer.invoke("set-theme-source", source),
  onNativeThemeUpdated: (callback) =>
    ipcRenderer.on("native-theme-updated", (_event, data) => callback(data)),
  removeNativeThemeUpdated: () =>
    ipcRenderer.removeAllListeners("native-theme-updated"),
});
