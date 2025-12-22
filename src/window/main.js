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
import * as uiDataService from "../back/services/uiDataService.js";
import * as syncService from "../back/services/syncService.js";

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

    // Normalize path based on platform
    let normalizedPath;
    if (process.platform === "win32") {
      // Windows: convert forward slashes to backslashes
      normalizedPath = decodedPath.replace(/\//g, "\\");
    } else {
      // Linux/macOS: ensure absolute path starts with /
      normalizedPath = decodedPath.startsWith("/")
        ? decodedPath
        : path.resolve(decodedPath);
    }

    console.log("Media protocol request:", {
      url: request.url,
      filePath,
      decodedPath,
      normalizedPath,
      platform: process.platform,
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

  ipcMain.handle("select-save-file", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        {
          name: "Save Files",
          extensions: [
            "sav",
            "srm",
            "brm",
            "mcr",
            "mcd",
            "eep",
            "sra",
            "fla",
            "dsv",
            "ps2",
            "raw",
            "gci",
            "bin",
          ],
        },
        { name: "All Files", extensions: ["*"] },
      ],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle("select-manual-pdf", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        {
          name: "PDF Files",
          extensions: ["pdf"],
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

  ipcMain.handle(
    "add-save-from-pc",
    async (event, romName, consoleId, saveFilePath) => {
      try {
        const fs = require("fs");
        const path = require("path");

        // Validate inputs
        if (!romName) {
          return {
            success: false,
            error: "No ROM selected",
          };
        }

        if (!consoleId) {
          return {
            success: false,
            error: "No console specified",
          };
        }

        if (!saveFilePath) {
          return {
            success: false,
            error: "No save file selected",
          };
        }

        // Import utility functions
        const { getSavePathPC } =
          await import("../back/services/utils/getPaths.js");
        const { updateRomInJson } =
          await import("../back/services/utils/getJsonUtils.js");

        // Get destination path for save file
        const savePathPC = getSavePathPC(consoleId, romName);
        const destDir = path.dirname(savePathPC);

        // Create Saves directory if it doesn't exist
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        // Copy save file to destination
        fs.copyFileSync(saveFilePath, savePathPC);

        // Update ROM JSON with save path
        try {
          updateRomInJson(romName, "savePath", savePathPC);
        } catch (jsonError) {
          console.warn("Could not update ROM JSON:", jsonError.message);
        }

        return {
          success: true,
          romName: romName,
          savePath: savePathPC,
          system: consoleId,
        };
      } catch (error) {
        console.error("Failed to add save file:", error);
        return { success: false, error: error.message };
      }
    },
  );

  ipcMain.handle(
    "add-cover-from-pc",
    async (event, romName, consoleId, coverFilePath) => {
      try {
        const fs = require("fs");
        const path = require("path");

        // Validate inputs
        if (!romName) {
          return {
            success: false,
            error: "No ROM selected",
          };
        }

        if (!consoleId) {
          return {
            success: false,
            error: "No console specified",
          };
        }

        if (!coverFilePath) {
          return {
            success: false,
            error: "No cover file selected",
          };
        }

        // Validate source file exists
        if (!fs.existsSync(coverFilePath)) {
          return {
            success: false,
            error: "Cover file does not exist",
          };
        }

        // Validate it's actually a file (not a directory)
        const stats = fs.statSync(coverFilePath);
        if (!stats.isFile()) {
          return {
            success: false,
            error: "Cover path is not a file",
          };
        }

        // Import utility functions
        const { getCoverPathPC } =
          await import("../back/services/utils/getPaths.js");
        const { updateRomInJson } =
          await import("../back/services/utils/getJsonUtils.js");

        // Use the original image extension
        const imageExtension = path.extname(coverFilePath).toLowerCase();

        // Validate image extension
        const validExtensions = [
          ".jpg",
          ".jpeg",
          ".png",
          ".gif",
          ".webp",
          ".bmp",
        ];
        if (!validExtensions.includes(imageExtension)) {
          return {
            success: false,
            error: `Invalid image format. Supported: ${validExtensions.join(", ")}`,
          };
        }

        // Get destination path for cover file
        const coverPathPC = getCoverPathPC(consoleId, romName, imageExtension);
        const destDir = path.dirname(coverPathPC);

        // Create Covers directory if it doesn't exist
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        // Delete old cover if exists with different extension
        const baseNameWithoutExt = path.basename(coverPathPC, imageExtension);
        const existingCovers = fs
          .readdirSync(destDir)
          .filter((file) => file.startsWith(baseNameWithoutExt));

        for (const oldCover of existingCovers) {
          const oldCoverPath = path.join(destDir, oldCover);
          if (oldCoverPath !== coverPathPC && fs.existsSync(oldCoverPath)) {
            fs.unlinkSync(oldCoverPath);
            console.log(`Deleted old cover: ${oldCoverPath}`);
          }
        }

        // Copy cover file to destination path
        fs.copyFileSync(coverFilePath, coverPathPC);

        // Verify the copy was successful
        if (!fs.existsSync(coverPathPC)) {
          return {
            success: false,
            error: "Failed to copy cover file",
          };
        }

        console.log(`Cover copied successfully: ${coverPathPC}`);

        // Update ROM JSON with cover path
        try {
          updateRomInJson(romName, "coverPath", coverPathPC);
        } catch (jsonError) {
          console.warn("Could not update ROM JSON:", jsonError.message);
        }

        return {
          success: true,
          romName: romName,
          coverPath: coverPathPC,
          system: consoleId,
        };
      } catch (error) {
        console.error("Failed to add cover file:", error);
        return { success: false, error: error.message };
      }
    },
  );

  ipcMain.handle(
    "add-manual-from-pc",
    async (event, romName, consoleId, manualFilePath) => {
      try {
        const fs = require("fs");
        const path = require("path");

        // Validate inputs
        if (!romName) {
          return {
            success: false,
            error: "No ROM selected",
          };
        }

        if (!consoleId) {
          return {
            success: false,
            error: "No console specified",
          };
        }

        if (!manualFilePath) {
          return {
            success: false,
            error: "No manual file selected",
          };
        }

        // Validate source file exists
        if (!fs.existsSync(manualFilePath)) {
          return {
            success: false,
            error: "Manual file does not exist",
          };
        }

        // Validate it's actually a file (not a directory)
        const stats = fs.statSync(manualFilePath);
        if (!stats.isFile()) {
          return {
            success: false,
            error: "Manual path is not a file",
          };
        }

        // Import utility functions
        const { getManualPathPC } =
          await import("../back/services/utils/getPaths.js");
        const { updateRomInJson } =
          await import("../back/services/utils/getJsonUtils.js");

        // Validate PDF extension
        const fileExtension = path.extname(manualFilePath).toLowerCase();
        if (fileExtension !== ".pdf") {
          return {
            success: false,
            error: "Only PDF files are supported for manuals",
          };
        }

        // Get destination path for manual file
        const manualPathPC = getManualPathPC(consoleId, romName);
        const destDir = path.dirname(manualPathPC);

        // Create Manuals directory if it doesn't exist
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        // Copy manual file to destination path
        fs.copyFileSync(manualFilePath, manualPathPC);

        // Verify the copy was successful
        if (!fs.existsSync(manualPathPC)) {
          return {
            success: false,
            error: "Failed to copy manual file",
          };
        }

        console.log(`Manual copied successfully: ${manualPathPC}`);

        // Update ROM JSON with manual path
        try {
          updateRomInJson(romName, "manualPath", manualPathPC);
        } catch (jsonError) {
          console.warn("Could not update ROM JSON:", jsonError.message);
        }

        return {
          success: true,
          romName: romName,
          manualPath: manualPathPC,
          system: consoleId,
        };
      } catch (error) {
        console.error("Failed to add manual file:", error);
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

  ipcMain.handle("export-rom-copy", async (event, sourcePath) => {
    try {
      const filePath = await syncService.exportRomCopy(sourcePath, dialog);
      if (filePath) {
        return { success: true, filePath };
      }
      return { success: false, error: "Export cancelled" };
    } catch (error) {
      console.error("Failed to export ROM:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("export-save-copy", async (event, sourcePath) => {
    try {
      const filePath = await syncService.exportSaveCopy(sourcePath, dialog);
      if (filePath) {
        return { success: true, filePath };
      }
      return { success: false, error: "Export cancelled" };
    } catch (error) {
      console.error("Failed to export save file:", error);
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
      return uiDataService.getGeneratedConsoles();
    } catch (error) {
      console.error("Failed to get generated consoles:", error);
      return [];
    }
  });

  ipcMain.handle("get-all-roms", async () => {
    try {
      return uiDataService.getAllRoms();
    } catch (error) {
      console.error("Failed to get all roms:", error);
      return {};
    }
  });

  ipcMain.handle("import-roms-pc", async (event, sdPath = "D:/") => {
    try {
      syncService.importRomsPC(sdPath);
      return { success: true };
    } catch (error) {
      console.error("Failed to import ROMs from PC:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("import-roms-sd", async (event, sdPath) => {
    try {
      syncService.importRomsPC(sdPath);
      return { success: true };
    } catch (error) {
      console.error("Failed to import ROMs from SD:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("export-roms-to-sd", async (event, sdPath) => {
    try {
      syncService.exportAllRomsPcToGalic(sdPath);
      return { success: true };
    } catch (error) {
      console.error("Failed to export ROMs to SD:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("get-all-custom-collections", async (allObjectRoms) => {
    try {
      return uiDataService.getAllCustomCollections(allObjectRoms);
    } catch (error) {
      console.error("Failed to get all custom collections:", error);
      return [];
    }
  });

  ipcMain.handle("get-collection-object", async (collectionName) => {
    try {
      return uiDataService.getCollectionObject(collectionName);
    } catch (error) {
      console.error("Failed to get collection object:", error);
      return null;
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
