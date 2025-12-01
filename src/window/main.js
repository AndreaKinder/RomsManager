const { app, BrowserWindow, ipcMain, dialog, shell, protocol, net } = require("electron");
const path = require("node:path");
const url = require("url");

// Register scheme as privileged
protocol.registerSchemesAsPrivileged([
  { scheme: 'media', privileges: { secure: true, supportFetchAPI: true, bypassCSP: true } }
]);

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
      webSecurity: true // Keep security enabled
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools();
};

app.whenReady().then(async () => {
  const storageModule = await import("../back/services/storage.js");
  storage = storageModule;
  storage.initStorage();

  protocol.handle('media', (request) => {
    const filePath = request.url.slice('media://'.length);
    // Decode URI component to handle spaces and special chars
    const decodedPath = decodeURIComponent(filePath);
    // Normalize path separators (convert forward slashes back to backslashes on Windows)
    const normalizedPath = process.platform === 'win32' ? decodedPath.replace(/\//g, '\\') : decodedPath;
    console.log('Media protocol request:', { url: request.url, filePath, decodedPath, normalizedPath });
    // Ensure we are using file protocol correctly
    return net.fetch(url.pathToFileURL(normalizedPath).toString());
  });

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

  ipcMain.handle("select-cover-image", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        {
          name: "Image Files",
          extensions: ["jpg", "jpeg", "png", "gif", "webp", "bmp"],
        },
        { name: "All Files", extensions: ["*"] },
      ],
    });
    return result.canceled ? null : result.filePaths[0];
  });



  ipcMain.handle("select-folder", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle("sync-roms", async (event, { systemId, drivePath }) => {
    try {
      const syncService = await import("../back/services/syncService.js");
      const allRoms = await storage.getAllRoms();
      return syncService.syncRoms(systemId, drivePath, allRoms);
    } catch (error) {
      console.error("Sync failed:", error);
      return { success: false, error: error.message };
    }
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
