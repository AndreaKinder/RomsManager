import fs from "fs";
import path from "path";
import os from "os";
import {
  setAppConfig,
  setPathLayout,
} from "../src/back/services/configService.js";
import {
  getRomPathPC,
  getSavePathPC,
  getStatesDirPC,
  getCoversDirPC,
} from "../src/back/services/utils/getPaths.js";
import {
  splitArgString,
  buildEmulatorArgs,
} from "../src/back/services/utils/emulatorArgs.js";
import { scanLocalLibrary } from "../src/back/services/libraryScannerService.js";
import { resolveLocalConsoleId } from "../src/back/services/rommService.js";

describe("Customizable Paths, Emulator Args, Scanner and RomM Mapping", () => {
  let tempConfigDir;
  let tempLibDir;
  const previousConfigDir = process.env.ROMSMANAGER_CONFIG_DIR;

  beforeAll(() => {
    tempConfigDir = fs.mkdtempSync(path.join(os.tmpdir(), "romsmanager-p2-cfg-"));
    tempLibDir = fs.mkdtempSync(path.join(os.tmpdir(), "romsmanager-p2-lib-"));
    process.env.ROMSMANAGER_CONFIG_DIR = tempConfigDir;

    setAppConfig({
      storageType: "external",
      romsBasePath: tempLibDir,
      syncEmulationStation: false,
    });
  });

  afterAll(() => {
    if (previousConfigDir === undefined) {
      delete process.env.ROMSMANAGER_CONFIG_DIR;
    } else {
      process.env.ROMSMANAGER_CONFIG_DIR = previousConfigDir;
    }
    fs.rmSync(tempConfigDir, { recursive: true, force: true });
    fs.rmSync(tempLibDir, { recursive: true, force: true });
  });

  describe("getPaths con layouts personalizables", () => {
    it("debe resolver el preset romm y respetar la extensión real de guardado", () => {
      setPathLayout({ preset: "romm" });

      expect(getRomPathPC("gc", "Paper Mario.rvz")).toBe(
        path.join(tempLibDir, "gc", "games", "Paper Mario.rvz"),
      );
      expect(getSavePathPC("gc", "Paper Mario.rvz", ".gci")).toBe(
        path.join(tempLibDir, "gc", "saves", "Paper Mario.gci"),
      );
      expect(getStatesDirPC("gc")).toBe(path.join(tempLibDir, "gc", "states"));
    });

    it("debe aplicar consoleOverrides por consola", () => {
      const customSwitchDir = path.join(tempLibDir, "ssd-switch");
      setPathLayout({
        preset: "custom",
        romsPattern: "{base}/roms/{console}",
        coversPattern: "{base}/media/{console}/covers",
        consoleOverrides: {
          switch: { romsDir: customSwitchDir },
          sfc: { folderName: "snes" },
        },
      });

      expect(getRomPathPC("switch", "Zelda.nsp")).toBe(
        path.join(customSwitchDir, "Zelda.nsp"),
      );
      expect(getRomPathPC("sfc", "SMW.sfc")).toBe(
        path.join(tempLibDir, "roms", "snes", "SMW.sfc"),
      );
      expect(getCoversDirPC("sfc")).toBe(
        path.join(tempLibDir, "media", "snes", "covers"),
      );
    });
  });

  describe("emulatorArgs", () => {
    it("debe dividir argumentos respetando comillas", () => {
      expect(splitArgString('-f -L "/my cores/dolphin.so" "{rom}"')).toEqual([
        "-f",
        "-L",
        "/my cores/dolphin.so",
        "{rom}",
      ]);
    });

    it("debe sustituir placeholders y añadir romPath si falta {rom}", () => {
      expect(
        buildEmulatorArgs('-b -e "{rom}"', "/games/Paper Mario.rvz"),
      ).toEqual(["-b", "-e", "/games/Paper Mario.rvz"]);

      expect(
        buildEmulatorArgs("--fullscreen", "/games/Test.iso"),
      ).toEqual(["--fullscreen", "/games/Test.iso"]);
    });
  });

  describe("libraryScannerService", () => {
    it("debe escanear una biblioteca con layout romm y alias de carpeta", () => {
      setPathLayout({ preset: "romm", consoleOverrides: {} });

      const gcGamesDir = path.join(tempLibDir, "gc", "games");
      const gcSavesDir = path.join(tempLibDir, "gc", "saves");
      const psxGamesDir = path.join(tempLibDir, "psx", "games");
      fs.mkdirSync(gcGamesDir, { recursive: true });
      fs.mkdirSync(gcSavesDir, { recursive: true });
      fs.mkdirSync(psxGamesDir, { recursive: true });

      fs.writeFileSync(path.join(gcGamesDir, "Paper Mario.rvz"), "dummy");
      fs.writeFileSync(path.join(gcSavesDir, "Paper Mario.gci"), "save");
      fs.writeFileSync(path.join(psxGamesDir, "Metal Gear Solid.chd"), "dummy");

      const result = scanLocalLibrary();
      expect(result.success).toBe(true);
      expect(result.added).toBe(2);

      const gcDb = JSON.parse(
        fs.readFileSync(path.join(tempLibDir, "database", "gc.json"), "utf-8"),
      );
      expect(gcDb["Paper Mario.rvz"].savePath).toBe(
        path.join(gcSavesDir, "Paper Mario.gci"),
      );

      const psDb = JSON.parse(
        fs.readFileSync(path.join(tempLibDir, "database", "ps.json"), "utf-8"),
      );
      expect(psDb["Metal Gear Solid.chd"].system).toBe("ps");
    });
  });

  describe("rommService.resolveLocalConsoleId", () => {
    it("debe resolver slugs de RomM usando platformMap o alias por defecto", () => {
      expect(resolveLocalConsoleId("ngc", {})).toBe("gc");
      expect(resolveLocalConsoleId("psx", {})).toBe("ps");
      expect(resolveLocalConsoleId("snes", {})).toBe("sfc");
      expect(resolveLocalConsoleId("custom-slug", { "custom-slug": "switch" })).toBe(
        "switch",
      );
    });
  });
});
