const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  shell,
  protocol,
  net,
} = require("electron");
const path = require("node:path");
const url = require("url");

// Register scheme as privileged
protocol.registerSchemesAsPrivileged([
  {
    scheme: "media",
    privileges: { secure: true, supportFetchAPI: true, bypassCSP: true },
  },
]);

if (require("electron-squirrel-startup")) {
  app.quit();
}

// let storage;

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
  // const storageModule = await import("../back/services/storage.js");
  // storage = storageModule;
  // storage.initStorage();

  protocol.handle("media", (request) => {
    const filePath = request.url.slice("media://".length);
    // Decode URI component to handle spaces and special chars
    const decodedPath = decodeURIComponent(filePath);
    // Normalize path separators (convert forward slashes back to backslashes on Windows)
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

  // ipcMain.handle("get-all-roms", async () => {
  //   return storage.getAllRoms();
  // });

  // ipcMain.handle("get-rom", async (event, id) => {
  //   return storage.getRom(id);
  // });

  // ipcMain.handle("create-rom", async (event, romData) => {
  //   return storage.createRom(romData);
  // });

  // ipcMain.handle("update-rom", async (event, id, updates) => {
  //   return storage.updateRom(id, updates);
  // });

  // ipcMain.handle("delete-rom", async (event, id) => {
  //   return storage.deleteRom(id);
  // });

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

  ipcMain.handle("add-rom-from-pc", async () => {
    try {
      const fs = require("fs");
      const path = require("path");

      // Select ROM file
      const result = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
          {
            name: "ROM Files",
            extensions: [
              "nes",
              "smc",
              "sfc",
              "md",
              "gen",
              "sms",
              "gb",
              "gbc",
              "gba",
              "n64",
              "z64",
              "v64",
              "nds",
              "bin",
              "cue",
              "iso",
              "pbp",
            ],
          },
          { name: "All Files", extensions: ["*"] },
        ],
      });

      if (result.canceled || !result.filePaths[0]) {
        return { success: false, canceled: true };
      }

      const romFilePath = result.filePaths[0];

      // Import using existing functions
      const { systemRomDecider } =
        await import("../back/services/utils/getFilters.js");
      const { getRomPathPC } =
        await import("../back/services/utils/getPaths.js");
      const { getRegisterRomTemplate, getWriteRomSystemJsonPC } =
        await import("../back/services/utils/getJsonRegisters.js");

      const romName = path.basename(romFilePath);
      const system = systemRomDecider(romName);

      if (!system) {
        return { success: false, error: "ROM file type not recognized" };
      }

      const romPathPC = getRomPathPC(system, romName);
      const destDir = path.dirname(romPathPC);

      // Create directory if needed
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Copy ROM
      fs.copyFileSync(romFilePath, romPathPC);

      // Register ROM
      const romTemplate = getRegisterRomTemplate(romPathPC);
      getWriteRomSystemJsonPC(romTemplate);

      return {
        success: true,
        romName: romName,
        system: system,
      };
    } catch (error) {
      console.error("Failed to add ROM:", error);
      return { success: false, error: error.message };
    }
  });

  // ipcMain.handle("export-to-sd", async (event, { systemId, drivePath }) => {
  //   try {
  //     const syncService = await import("../back/services/syncService.js");
  //     const allRoms = await storage.getAllRoms();

  //     // Extract covers from ROMs
  //     const covers = allRoms
  //       .filter((rom) => rom.cover_path)
  //       .map((rom) => ({
  //         file_name: path.basename(rom.cover_path),
  //         file_path: rom.cover_path,
  //         console: rom.console,
  //       }));

  //     return syncService.exportToSD(systemId, drivePath, allRoms, covers);
  //   } catch (error) {
  //     console.error("Export failed:", error);
  //     return { success: false, error: error.message };
  //   }
  // });

  // ipcMain.handle("import-from-sd", async (event, { systemId, drivePath }) => {
  //   try {
  //     const syncService = await import("../back/services/syncService.js");
  //     const result = await syncService.importFromSD(systemId, drivePath);

  //     console.log("Import result:", {
  //       romsFound: result.romsFound?.length || 0,
  //       coversFound: result.coversFound?.length || 0,
  //       errors: result.errors,
  //     });

  //     let imported = 0;
  //     if (result.romsFound && result.romsFound.length > 0) {
  //       for (const romData of result.romsFound) {
  //         const existingRoms = await storage.getAllRoms();
  //         const exists = existingRoms.some(
  //           (r) => r.file_name === romData.file_name,
  //         );

  //         console.log(`ROM ${romData.file_name} - exists: ${exists}`);

  //         if (!exists) {
  //           // Find matching cover
  //           const matchingCover = result.coversFound?.find(
  //             (c) =>
  //               path.parse(c.file_name).name ===
  //               path.parse(romData.file_name).name,
  //           );

  //           await storage.createRom({
  //             file_path: romData.file_path,
  //             file_name: romData.file_name,
  //             file_size: romData.size,
  //             console: romData.console,
  //             cover_path: matchingCover?.file_path || null,
  //             title:
  //               romData.metadata?.title || path.parse(romData.file_name).name,
  //             year: romData.metadata?.year,
  //             genre: romData.metadata?.genre,
  //             metadata: romData.metadata,
  //           });
  //           imported++;
  //         }
  //       }
  //     }

  //     return {
  //       success: true,
  //       romsImported: imported,
  //       romsFound: result.romsFound?.length || 0,
  //       coversFound: result.coversFound?.length || 0,
  //       metadataImported: result.metadataImported || 0,
  //       errors: result.errors,
  //     };
  //   } catch (error) {
  //     console.error("Import failed:", error);
  //     return { success: false, error: error.message };
  //   }
  // });

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

  // ipcMain.handle("sync-roms", async (event, { systemId, drivePath }) => {
  //   try {
  //     const syncService = await import("../back/services/syncService.js");
  //     const allRoms = await storage.getAllRoms();

  //     // Extract covers from ROMs
  //     const covers = allRoms
  //       .filter((rom) => rom.cover_path)
  //       .map((rom) => ({
  //         file_name: path.basename(rom.cover_path),
  //         file_path: rom.cover_path,
  //         console: rom.console,
  //       }));

  //     // Perform bidirectional sync
  //     const syncResult = await syncService.syncBidirectional(
  //       systemId,
  //       drivePath,
  //       allRoms,
  //       covers,
  //     );

  //     // Import found ROMs into database
  //     let imported = 0;
  //     if (
  //       syncResult.import.romsFound &&
  //       syncResult.import.romsFound.length > 0
  //     ) {
  //       for (const romData of syncResult.import.romsFound) {
  //         // Check if ROM already exists by file_name
  //         const existingRoms = await storage.getAllRoms();
  //         const exists = existingRoms.some(
  //           (r) => r.file_name === romData.file_name,
  //         );

  //         if (!exists) {
  //           // Find matching cover
  //           const matchingCover = syncResult.import.coversFound?.find(
  //             (c) =>
  //               path.parse(c.file_name).name ===
  //               path.parse(romData.file_name).name,
  //           );

  //           await storage.createRom({
  //             file_path: romData.file_path,
  //             file_name: romData.file_name,
  //             file_size: romData.size,
  //             console: romData.console,
  //             cover_path: matchingCover?.file_path || null,
  //             title:
  //               romData.metadata?.title || path.parse(romData.file_name).name,
  //             year: romData.metadata?.year,
  //             genre: romData.metadata?.genre,
  //             metadata: romData.metadata,
  //           });
  //           imported++;
  //         }
  //       }
  //     }

  //     return {
  //       success: true,
  //       export: syncResult.export,
  //       import: {
  //         romsImported: imported,
  //         romsFound: syncResult.import.romsFound?.length || 0,
  //         coversFound: syncResult.import.coversFound?.length || 0,
  //         metadataImported: syncResult.import.metadataImported || 0,
  //         errors: syncResult.import.errors,
  //       },
  //     };
  //   } catch (error) {
  //     console.error("Sync failed:", error);
  //     return { success: false, error: error.message };
  //   }
  // });

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
