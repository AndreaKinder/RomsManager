import fs from "fs";
import path from "path";
import { getPathSystemJsonSystemsPC } from "./utils/getPaths.js";

function getTitleRom(jsonSystemFile) {
  return jsonSystemFile.split(".")[0];
}

export function getArraySystemsJson() {
  const systemPath = getPathSystemJsonSystemsPC();
  try {
    if (!fs.existsSync(systemPath)) {
      return [];
    }
    const systems = fs.readdirSync(systemPath, { withFileTypes: true });
    return systems
      .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".json"))
      .map((dirent) => dirent.name);
  } catch (err) {
    console.error("Error leyendo directorio:", err);
    return [];
  }
}

function getArraySystems() {
  const systemsJson = getArraySystemsJson();
  return systemsJson.map((system) => getTitleRom(system));
}

export function getGeneratedConsoles() {
  const systemPath = getPathSystemJsonSystemsPC();
  const systemsJson = getArraySystemsJson();

  const consoles = systemsJson.map((jsonFile) => {
    const consoleId = getTitleRom(jsonFile);
    const jsonPath = path.join(systemPath, jsonFile);

    try {
      const fileContent = fs.readFileSync(jsonPath, "utf-8");
      const romsData = JSON.parse(fileContent);
      const roms = Object.values(romsData);

      return {
        consoleId,
        consoleName: consoleId.toUpperCase(),
        romCount: roms.length,
        roms: roms,
      };
    } catch (err) {
      console.error(`Error reading ${jsonFile}:`, err);
      return {
        consoleId,
        consoleName: consoleId.toUpperCase(),
        romCount: 0,
        roms: [],
      };
    }
  });

  return consoles.filter((console) => console.romCount > 0);
}
