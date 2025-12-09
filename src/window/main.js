import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  shell,
  protocol,
  net,
} from "electron";
import path from "node:path";
import url from "url";

protocol.registerSchemesAsPrivileged([
  {
    scheme: "media",
    privileges: { secure: true, supportFetchAPI: true, bypassCSP: true },
  },
]);

if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "../../assets/icon.png"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  mainWindow.setMenu(null);
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

app.whenReady().then(async () => {
  protocol.handle("media", (request) => {
    const filePath = request.url.slice("media://".length);
    const decodedPath = decodeURIComponent(filePath);
    const normalizedPath =
      process.platform === "win32"
        ? decodedPath.replace(/\//g, "\\")
        : decodedPath;
    console.log("Media protocol request:", {
      url: request.url,
      filePath,
      decodedPath,
      normalizedPath,
    });
    // Ensure we are using file protocol correctly
    return net.fetch(url.pathToFileURL(normalizedPath).toString());
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

  ipcMain.handle(
    "add-rom-from-pc",
    async (event, selectedConsole, romFilePath) => {
      try {
        const fs = require("fs");
        const path = require("path");

        // If no console is selected, return error
        if (!selectedConsole) {
          return {
            success: false,
            error: "No console selected",
            needsConsoleSelection: true,
          };
        }

        // If no ROM file path is provided, return error
        if (!romFilePath) {
          return {
            success: false,
            error: "No ROM file selected",
          };
        }

        // Import using existing functions
        const { getRomPathPC } =
          await import("../back/services/utils/getPaths.js");
        const { createRomTemplate, persistRomToJson } =
          await import("../back/services/utils/getJsonUtils.js");

        const romName = path.basename(romFilePath);
        const system = selectedConsole;

        const romPathPC = getRomPathPC(system, romName);
        const destDir = path.dirname(romPathPC);

        // Create directory if needed
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        // Copy ROM
        fs.copyFileSync(romFilePath, romPathPC);

        // Register ROM
        const romTemplate = createRomTemplate(romPathPC);
        persistRomToJson(romTemplate);

        return {
          success: true,
          romName: romName,
          system: system,
        };
      } catch (error) {
        console.error("Failed to add ROM:", error);
        return { success: false, error: error.message };
      }
    },
  );

  ipcMain.handle("edit-rom-title", async (event, romName, newTitle) => {
    try {
      const { editRomTitle } = await import("../back/services/editService.js");
      const result = editRomTitle(romName, newTitle);
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to edit ROM title:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("edit-rom-name", async (event, romName, newRomName) => {
    try {
      const { editRomName } = await import("../back/services/editService.js");
      const result = editRomName(romName, newRomName);
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to edit ROM name:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("delete-rom", async (event, romName) => {
    try {
      const { deleteRomFromJson } =
        await import("../back/services/utils/getJsonUtils.js");
      const result = deleteRomFromJson(romName);
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to delete ROM:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("get-available-consoles", async () => {
    try {
      const consolesData = await import("../back/data/consoles.json", {
        with: { type: "json" },
      });
      return Object.values(consolesData.default.consoles).map((console) => ({
        id: console.id_name,
        name: console.name,
        extensions: console.file,
      }));
    } catch (error) {
      console.error("Failed to get available consoles:", error);
      return [];
    }
  });

  ipcMain.handle("get-generated-consoles", async () => {
    try {
      const uiDataService = await import("../back/services/uiDataService.js");
      return uiDataService.getGeneratedConsoles();
    } catch (error) {
      console.error("Failed to get generated consoles:", error);
      return [];
    }
  });

  ipcMain.handle("import-roms-pc", async (event, sdPath = "D:/") => {
    try {
      const syncService = await import("../back/services/syncService.js");
      syncService.importRomsPC(sdPath);
      return { success: true };
    } catch (error) {
      console.error("Failed to import ROMs from PC:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("import-roms-sd", async (event, sdPath) => {
    try {
      const syncService = await import("../back/services/syncService.js");
      syncService.importRomsPC(sdPath);
      return { success: true };
    } catch (error) {
      console.error("Failed to import ROMs from SD:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("export-roms-to-sd", async (event, sdPath) => {
    try {
      const syncService = await import("../back/services/syncService.js");
      syncService.exportAllRomsPcToGalic(sdPath);
      return { success: true };
    } catch (error) {
      console.error("Failed to export ROMs to SD:", error);
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
