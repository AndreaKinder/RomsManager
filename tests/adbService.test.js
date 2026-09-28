import {
  ANDROID_SYSTEM_FOLDERS,
  getDefaultFolderForConsole,
  mapFolderToConsoleId,
  parseAdbDevicesOutput,
  CONSOLE_DISPLAY_NAMES,
} from "../src/back/services/adbService.js";

describe("adbService - Android Console ADB Synchronization", () => {
  describe("Console Folder Mappings", () => {
    it("debe retornar la carpeta por defecto de Android para cada consola", () => {
      expect(getDefaultFolderForConsole("sfc")).toBe("snes");
      expect(getDefaultFolderForConsole("ps")).toBe("psx");
      expect(getDefaultFolderForConsole("gba")).toBe("gba");
      expect(getDefaultFolderForConsole("genesis")).toBe("genesis");
      expect(getDefaultFolderForConsole("nes")).toBe("nes");
      expect(getDefaultFolderForConsole("n64")).toBe("n64");
      expect(getDefaultFolderForConsole("psp")).toBe("psp");
    });

    it("debe mapear correctamente nombres de carpetas remotas a console IDs", () => {
      expect(mapFolderToConsoleId("snes")).toBe("sfc");
      expect(mapFolderToConsoleId("SFC")).toBe("sfc");
      expect(mapFolderToConsoleId("psx")).toBe("ps");
      expect(mapFolderToConsoleId("ps1")).toBe("ps");
      expect(mapFolderToConsoleId("PS")).toBe("ps");
      expect(mapFolderToConsoleId("megadrive")).toBe("genesis");
      expect(mapFolderToConsoleId("genesis")).toBe("genesis");
      expect(mapFolderToConsoleId("fc")).toBe("nes");
      expect(mapFolderToConsoleId("nes")).toBe("nes");
      expect(mapFolderToConsoleId("gamecube")).toBe("gc");
      expect(mapFolderToConsoleId("carpeta_inexistente")).toBeNull();
    });

    it("debe incluir nombres legibles en CONSOLE_DISPLAY_NAMES", () => {
      expect(CONSOLE_DISPLAY_NAMES.sfc).toContain("Super Nintendo");
      expect(CONSOLE_DISPLAY_NAMES.gba).toContain("Game Boy Advance");
      expect(CONSOLE_DISPLAY_NAMES.ps).toContain("PlayStation");
    });
  });

  describe("ADB Devices Output Parsing", () => {
    it("debe procesar la salida de adb devices -l con consolas conectadas por cable USB", () => {
      const mockOutput = `
List of devices attached
0123456789ABCDEF       device usb:1-1 product:odin2 model:Odin2 device:odin2 transport_id:1
9889d5434752494e4a     device usb:1-2 product:retroid_pocket_4_pro model:RP4Pro device:rp4 transport_id:2
1234567890             unauthorized usb:1-3 transport_id:3
`;

      const devices = parseAdbDevicesOutput(mockOutput);
      expect(devices).toHaveLength(3);

      // Dispositivo 1: Ayn Odin 2 por USB
      expect(devices[0].serial).toBe("0123456789ABCDEF");
      expect(devices[0].state).toBe("device");
      expect(devices[0].model).toBe("Odin2");
      expect(devices[0].isWireless).toBe(false);
      expect(devices[0].displayName).toContain("Odin2");
      expect(devices[0].displayName).toContain("USB");

      // Dispositivo 2: Retroid Pocket 4 Pro por USB
      expect(devices[1].serial).toBe("9889d5434752494e4a");
      expect(devices[1].state).toBe("device");
      expect(devices[1].model).toBe("RP4Pro");
      expect(devices[1].isWireless).toBe(false);

      // Dispositivo 3: Sin autorizar (pantalla bloqueada / diálogo RSA en Android)
      expect(devices[2].serial).toBe("1234567890");
      expect(devices[2].state).toBe("unauthorized");
    });

    it("debe detectar dispositivos inalámbricos si tienen IP:puerto", () => {
      const mockOutput = `
List of devices attached
192.168.1.150:5555     device product:odin2 model:Odin2 device:odin2 transport_id:4
`;
      const devices = parseAdbDevicesOutput(mockOutput);
      expect(devices).toHaveLength(1);
      expect(devices[0].isWireless).toBe(true);
      expect(devices[0].displayName).toContain("WiFi");
    });

    it("debe manejar salidas vacías o solo con cabecera", () => {
      const emptyOutput = "List of devices attached\n\n";
      const devices = parseAdbDevicesOutput(emptyOutput);
      expect(devices).toEqual([]);
    });
  });

  describe("Export and Import Operations", () => {
    it("debe retornar éxito inmediato si la lista de items está vacía al exportar", async () => {
      const { exportRomsToAndroid, importRomsFromAndroid } = await import(
        "../src/back/services/adbService.js"
      );
      const resExport = await exportRomsToAndroid("test-serial", "/sdcard/ROMs", []);
      expect(resExport).toEqual({ success: true, count: 0, errors: [] });

      const resImport = await importRomsFromAndroid("test-serial", []);
      expect(resImport).toEqual({ success: true, count: 0, errors: [] });
    });
  });
});
