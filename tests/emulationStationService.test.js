import fs from "fs";
import path from "path";
import os from "os";
import {
  formatEsReleaseDate,
  getGamelistPathForConsole,
  syncSystemGamelist,
  parseGamelistXml,
  syncAllGamelists,
} from "../src/back/services/emulationStationService.js";
import {
  setAppConfig,
  setSyncEmulationStation,
} from "../src/back/services/configService.js";

describe("EmulationStationService", () => {
  const testDir = path.join(os.tmpdir(), "romsmanager-es-test-" + Date.now());
  const testDbDir = path.join(testDir, "database");

  beforeAll(() => {
    fs.mkdirSync(testDir, { recursive: true });
    fs.mkdirSync(testDbDir, { recursive: true });

    // Set configuration pointing to our test directory
    setAppConfig({
      storageType: "external",
      romsBasePath: testDir,
      syncEmulationStation: true,
    });
  });

  afterAll(() => {
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch {}
  });

  describe("formatEsReleaseDate", () => {
    it("debe formatear fechas YYYY-MM-DD a YYYYMMDDTHHMMSS", () => {
      expect(formatEsReleaseDate("1996-06-23")).toBe("19960623T000000");
    });

    it("debe formatear solo año YYYY a YYYY0101T000000", () => {
      expect(formatEsReleaseDate("1990")).toBe("19900101T000000");
    });

    it("debe mantener fechas ya formateadas", () => {
      expect(formatEsReleaseDate("19981121T000000")).toBe("19981121T000000");
    });

    it("debe retornar null para valores vacíos o no válidos", () => {
      expect(formatEsReleaseDate(null)).toBeNull();
      expect(formatEsReleaseDate("")).toBeNull();
      expect(formatEsReleaseDate("invalid")).toBeNull();
    });
  });

  describe("syncSystemGamelist y parseGamelistXml", () => {
    const consoleId = "sfc";
    const romName = "Super Mario World.sfc";

    beforeEach(() => {
      // Mock console database file
      const romsData = {
        [romName]: {
          romName,
          system: consoleId,
          title: "Super Mario World",
          romPath: path.join(testDir, "Roms", consoleId, romName),
          description: "A classic SNES platformer game.",
          developer: "Nintendo",
          releaseDate: "1990-11-21",
        },
      };

      fs.writeFileSync(
        path.join(testDbDir, `${consoleId}.json`),
        JSON.stringify(romsData, null, 2),
        "utf-8",
      );
    });

    it("debe saltar sincronización si syncEmulationStation está deshabilitado", () => {
      setSyncEmulationStation(false);
      const result = syncSystemGamelist(consoleId);
      expect(result.skipped).toBe(true);
      expect(result.reason).toBe("sync_disabled");
    });

    it("debe generar gamelist.xml válido cuando syncEmulationStation está habilitado", async () => {
      setSyncEmulationStation(true);
      const result = syncSystemGamelist(consoleId);
      expect(result.success).toBe(true);
      expect(result.count).toBe(1);

      const xmlPath = getGamelistPathForConsole(consoleId);
      expect(fs.existsSync(xmlPath)).toBe(true);

      const parsed = await parseGamelistXml(xmlPath);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe("Super Mario World");
      expect(parsed[0].path).toBe(`./${romName}`);
      expect(parsed[0].developer).toBe("Nintendo");
      expect(parsed[0].desc).toContain("classic SNES platformer");
      expect(parsed[0].releaseDate).toBe("19901121T000000");
    });

    it("debe sincronizar todas las consolas existentes con syncAllGamelists", () => {
      setSyncEmulationStation(true);
      const result = syncAllGamelists();
      expect(result.success).toBe(true);
      expect(result.syncedConsoles).toBeGreaterThanOrEqual(1);
      expect(result.consoles).toContain(consoleId);
    });
  });
});
