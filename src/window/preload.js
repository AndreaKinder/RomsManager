const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getAllRoms: () => ipcRenderer.invoke("get-all-roms"),
  getRom: (id) => ipcRenderer.invoke("get-rom", id),
  createRom: (romData) => ipcRenderer.invoke("create-rom", romData),
  updateRom: (id, updates) => ipcRenderer.invoke("update-rom", id, updates),
  deleteRom: (id) => ipcRenderer.invoke("delete-rom", id),
  selectRomFile: () => ipcRenderer.invoke("select-rom-file"),
});
