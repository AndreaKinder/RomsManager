import {
  extractFileExtension,
  getExtensionsBySystemId,
  findSystemByExtension,
  identifyRomSystem,
} from "../src/back/services/utils/getFilters.js";

describe("Utils: getFilters", () => {
  describe("extractFileExtension", () => {
    it("debe extraer la extensión en minúsculas correctamente", () => {
      expect(extractFileExtension("SuperMario.NES")).toBe("nes");
      expect(extractFileExtension("Pokemon_Emerald.gba")).toBe("gba");
      expect(extractFileExtension("archive.tar.gz")).toBe("gz");
    });

    it("debe retornar string vacío si el archivo no tiene extensión", () => {
      expect(extractFileExtension("noextensionfile")).toBe("");
    });
  });

  describe("getExtensionsBySystemId", () => {
    it("debe retornar las extensiones soportadas para NES", () => {
      const extensions = getExtensionsBySystemId("nes");
      expect(extensions).toBeDefined();
      expect(extensions).toContain(".nes");
    });

    it("debe retornar las extensiones soportadas para GBA", () => {
      const extensions = getExtensionsBySystemId("gba");
      expect(extensions).toBeDefined();
      expect(extensions).toContain(".gba");
    });
  });

  describe("findSystemByExtension y identifyRomSystem", () => {
    it("debe identificar la consola correcta según la extensión", () => {
      expect(findSystemByExtension("nes")).toBe("nes");
      expect(findSystemByExtension("sfc")).toBe("sfc");
      expect(findSystemByExtension("gba")).toBe("gba");
      expect(findSystemByExtension("iso")).toBeDefined();
    });

    it("debe identificar la consola a partir del nombre completo del archivo", () => {
      expect(identifyRomSystem("SuperMarioBros.nes")).toBe("nes");
      expect(identifyRomSystem("Zelda_Minish_Cap.GBA")).toBe("gba");
    });

    it("debe retornar undefined para extensiones no soportadas", () => {
      expect(identifyRomSystem("document.docx")).toBeUndefined();
    });
  });
});
