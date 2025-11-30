const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("node:path");

if (require("electron-squirrel-startup")) {
  app.quit();
}

let storage;

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools();
};

app.whenReady().then(async () => {
  const storageModule = await import("../back/services/storage.js");
  storage = storageModule;
  storage.initStorage();

  ipcMain.handle("get-all-roms", async () => {
    return storage.getAllRoms();
  });

  ipcMain.handle("get-rom", async (event, id) => {
    return storage.getRom(id);
  });

  ipcMain.handle("create-rom", async (event, romData) => {
    return storage.createRom(romData);
  });

  ipcMain.handle("update-rom", async (event, id, updates) => {
    return storage.updateRom(id, updates);
  });

  ipcMain.handle("delete-rom", async (event, id) => {
    return storage.deleteRom(id);
  });

  ipcMain.handle("select-rom-file", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        {
          name: "ROM Files",
          extensions: [
            "nes",
            "snes",
            "gba",
            "gbc",
            "n64",
            "z64",
            "v64",
            "iso",
            "bin",
            "cue",
          ],
        },
        { name: "All Files", extensions: ["*"] },
      ],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
