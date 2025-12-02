const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getAllRoms: () => ipcRenderer.invoke("get-all-roms"),
  getRom: (id) => ipcRenderer.invoke("get-rom", id),
  createRom: (romData) => ipcRenderer.invoke("create-rom", romData),
  updateRom: (id, updates) => ipcRenderer.invoke("update-rom", id, updates),
  deleteRom: (id) => ipcRenderer.invoke("delete-rom", id),
  selectRomFile: () => ipcRenderer.invoke("select-rom-file"),
  selectCoverImage: () => ipcRenderer.invoke("select-cover-image"),
  selectFolder: () => ipcRenderer.invoke("select-folder"),
  exportToSD: (data) => ipcRenderer.invoke("export-to-sd", data),
  importFromSD: (data) => ipcRenderer.invoke("import-from-sd", data),
  syncRoms: (data) => ipcRenderer.invoke("sync-roms", data),
  getGeneratedConsoles: () => ipcRenderer.invoke("get-generated-consoles"),
  importRomsPC: () => ipcRenderer.invoke("import-roms-pc"),
});
