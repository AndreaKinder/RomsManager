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
  getRomsBasePath,
  setRomsBasePath,
  hasRomsBasePath,
  getAppConfig,
  setAppConfig,
} from "../src/back/services/configService.js";

describe("ConfigService - Storage and Sync Options", () => {
  const originalConfigPath =
    process.platform === "win32"
      ? path.join(process.env.APPDATA || "", "romsmanager", "config.json")
      : path.join(os.homedir(), ".config/romsmanager", "config.json");

  let backupConfig = null;

  beforeAll(() => {
    if (fs.existsSync(originalConfigPath)) {
      backupConfig = fs.readFileSync(originalConfigPath, "utf-8");
    }
  });

  afterAll(() => {
    if (backupConfig !== null) {
      fs.writeFileSync(originalConfigPath, backupConfig, "utf-8");
    }
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
    const mockExternalPath = path.join(os.tmpdir(), "mock-external-roms");
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
    const mockInternalPath = path.join(os.homedir(), "Roms");
    setAppConfig({
      storageType: "internal",
      romsBasePath: mockInternalPath,
      syncEmulationStation: false,
    });

    const dbPath = getDatabasePath();
    expect(dbPath).not.toContain(mockInternalPath);
    expect(dbPath).toContain("database");
    expect(hasRomsBasePath()).toBe(true);
  });

  it("debe retornar getAppConfig completo", () => {
    const config = getAppConfig();
    expect(config).toHaveProperty("storageType");
    expect(config).toHaveProperty("romsBasePath");
    expect(config).toHaveProperty("syncEmulationStation");
    expect(config).toHaveProperty("databasePath");
  });
});
