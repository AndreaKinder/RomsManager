import fs from "fs";
import path from "path";
import os from "os";
import { getScraperConfig } from "../src/back/services/configService.js";
import {
  getAllCustomCollections,
  getCollectionObject,
} from "../src/back/services/uiDataService.js";
import { createRomTemplate } from "../src/back/services/utils/getJsonUtils.js";

describe("Audit Fixes - Services & Regression Tests", () => {
  describe("configService.getScraperConfig", () => {
    it("no debe incluir credenciales huérfanas de igdb en la configuración por defecto", () => {
      const config = getScraperConfig();
      expect(config.credentials).toHaveProperty("screenscraper");
      expect(config.credentials).toHaveProperty("thegamesdb");
      expect(config.credentials).not.toHaveProperty("igdb");
    });
  });

  describe("uiDataService - Custom Collections", () => {
    const sampleRoms = [
      {
        romName: "SuperMario.nes",
        title: "Super Mario Bros",
        collections: ["Favoritos", "Plataformas"],
      },
      {
        romName: "Zelda.nes",
        title: "The Legend of Zelda",
        collections: ["Favoritos"],
      },
      {
        romName: "Tetris.gb",
        title: "Tetris",
      },
    ];

    it("debe agrupar ROMs usando el array romObject.collections", () => {
      const result = getCollectionObject(sampleRoms);
      expect(result).toHaveProperty("Favoritos");
      expect(result).toHaveProperty("Plataformas");
      expect(result.Favoritos.roms).toHaveLength(2);
      expect(result.Plataformas.roms).toHaveLength(1);
    });

    it("getAllCustomCollections debe devolver un array con las colecciones extraídas", () => {
      const list = getAllCustomCollections(sampleRoms);
      expect(Array.isArray(list)).toBe(true);
      expect(list).toHaveLength(2);
      expect(list.map((c) => c.collectionName)).toEqual([
        "Favoritos",
        "Plataformas",
      ]);
    });

    it("no debe fallar si una ROM no tiene propiedad collections", () => {
      expect(() => getCollectionObject([sampleRoms[2]])).not.toThrow();
    });
  });

  describe("getJsonUtils.createRomTemplate", () => {
    it("debe conservar el parámetro system en la plantilla generada", () => {
      const romPath = path.join(os.tmpdir(), "SuperMario.nes");
      const template = createRomTemplate(romPath, "nes");
      expect(template).toEqual({
        romName: "SuperMario.nes",
        system: "nes",
        title: "SuperMario",
        romPath,
      });
    });
  });

  describe("preload.js - Canales IPC", () => {
    it("no debe exponer canales IPC huérfanos (exportToSD, importFromSD, syncRoms)", () => {
      const preloadContent = fs.readFileSync(
        path.resolve("src/window/preload.js"),
        "utf-8",
      );
      expect(preloadContent).not.toContain("export-to-sd");
      expect(preloadContent).not.toContain("import-from-sd");
      expect(preloadContent).not.toContain("sync-roms");
    });
  });

  describe("editService.editRomName", () => {
    it("debe retornar el resultado de updateRomInJson", () => {
      const editServiceContent = fs.readFileSync(
        path.resolve("src/back/services/editService.js"),
        "utf-8",
      );
      expect(editServiceContent).toMatch(/return\s+updateRomInJson\(romName,\s*"romName",\s*newRomName(?:,\s*consoleId)?\)/);
    });
  });
});
