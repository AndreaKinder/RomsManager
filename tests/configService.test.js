import fs from "fs";
import path from "path";
import os from "os";
import {
  getDefaultInternalRomsPath,
  getDatabasePath,
  getStorageType,
  setStorageType,
  getSyncEmulationStation,
  setSyncEmulationStation,
  hasRomsBasePath,
  getAppConfig,
  setAppConfig,
  getPathLayout,
  setPathLayout,
  setEmulator,
  getEmulatorForConsole,
  getRommConfig,
  setRommConfig,
} from "../src/back/services/configService.js";

describe("ConfigService - Storage, Layouts, Emulators and RomM", () => {
  let tempConfigDir;
  const previousConfigDir = process.env.ROMSMANAGER_CONFIG_DIR;

  beforeAll(() => {
    tempConfigDir = fs.mkdtempSync(path.join(os.tmpdir(), "romsmanager-cfg-test-"));
    process.env.ROMSMANAGER_CONFIG_DIR = tempConfigDir;
  });

  afterAll(() => {
    if (previousConfigDir === undefined) {
      delete process.env.ROMSMANAGER_CONFIG_DIR;
    } else {
      process.env.ROMSMANAGER_CONFIG_DIR = previousConfigDir;
    }
    fs.rmSync(tempConfigDir, { recursive: true, force: true });
  });

  it("debe retornar la ruta interna por defecto para ROMs", () => {
    const internalPath = getDefaultInternalRomsPath();
    expect(internalPath).toBeDefined();
    expect(internalPath).toContain("Roms");
  });

  it("debe configurar y leer storageType correctamente", () => {
    setStorageType("internal");
    expect(getStorageType()).toBe("internal");

    setStorageType("external");
    expect(getStorageType()).toBe("external");
  });

  it("debe configurar y leer syncEmulationStation correctamente", () => {
    setSyncEmulationStation(true);
    expect(getSyncEmulationStation()).toBe(true);

    setSyncEmulationStation(false);
    expect(getSyncEmulationStation()).toBe(false);
  });

  it("debe calcular la ruta de base de datos en disco externo cuando storageType es external", () => {
    const mockExternalPath = path.join(tempConfigDir, "mock-external-roms");
    setAppConfig({
      storageType: "external",
      romsBasePath: mockExternalPath,
      syncEmulationStation: true,
    });

    const dbPath = getDatabasePath();
    expect(dbPath).toBe(path.join(mockExternalPath, "database"));
    expect(hasRomsBasePath()).toBe(true);
  });

  it("debe calcular la ruta de base de datos en disco interno cuando storageType es internal", () => {
    const mockInternalPath = path.join(tempConfigDir, "internal-roms");
    setAppConfig({
      storageType: "internal",
      romsBasePath: mockInternalPath,
      syncEmulationStation: false,
    });

    const dbPath = getDatabasePath();
    expect(dbPath).toBe(path.join(tempConfigDir, "database"));
    expect(hasRomsBasePath()).toBe(true);
  });

  it("debe guardar y resolver presets y plantillas de pathLayout", () => {
    const rommLayout = setPathLayout({ preset: "romm" });
    expect(rommLayout.preset).toBe("romm");
    expect(rommLayout.romsPattern).toBe("{base}/{console}/games");
    expect(rommLayout.savesPattern).toBe("{base}/{console}/saves");

    const customLayout = setPathLayout({
      preset: "custom",
      romsPattern: "{base}/custom/{console}",
      consoleOverrides: { gc: { folderName: "gamecube" } },
    });
    expect(customLayout.romsPattern).toBe("{base}/custom/{console}");
    expect(getPathLayout().consoleOverrides.gc.folderName).toBe("gamecube");
  });

  it("debe guardar emuladores con argumentos y normalizar entradas", () => {
    setEmulator("gc", { path: "/usr/bin/dolphin-emu", args: '-b -e "{rom}"' });
    const emu = getEmulatorForConsole("gc");
    expect(emu).toEqual({
      path: "/usr/bin/dolphin-emu",
      args: '-b -e "{rom}"',
      workingDir: "",
    });
  });

  it("debe persistir configuración genérica de RomM", () => {
    const updated = setRommConfig({
      enabled: true,
      serverUrl: "https://romm.example.com",
      authType: "token",
      apiToken: "secret-token",
      platformMap: { ngc: "gc" },
    });
    expect(updated.enabled).toBe(true);
    expect(updated.serverUrl).toBe("https://romm.example.com");
    expect(getRommConfig().platformMap.ngc).toBe("gc");
  });

  it("debe retornar getAppConfig completo", () => {
    const config = getAppConfig();
    expect(config).toHaveProperty("storageType");
    expect(config).toHaveProperty("romsBasePath");
    expect(config).toHaveProperty("syncEmulationStation");
    expect(config).toHaveProperty("databasePath");
    expect(config).toHaveProperty("pathLayout");
  });
});
