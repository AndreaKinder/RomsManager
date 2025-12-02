import fs from "fs";
import { getPathSystemJsonSystemsPC } from "./getPaths";

function getTitleRom(jsonSystemFile) {
  return jsonSystemFile.split(".")[0];
}

export function getArraySystemsJson() {
  const systemPath = getPathSystemJsonSystemsPC();
  try {
    const systems = fs.readdirSync(systemPath, { withFileTypes: true });
    return systems
      .filter((dirent) => dirent.isFile())
      .map((dirent) => dirent.name);
  } catch (err) {
    console.error("Error leyendo directorio:", err);
    return [];
  }
}

function getArraySystems() {
  const getArraySystemsJson = getArraySystemsJson();
  return getArraySystemsJson.map((system) => getTitleRom(system));
}
