import fs from "fs";
import path from "path";
import { getPathSystemJsonSystemsPC } from "./utils/getPaths.js";
import logger from "./utils/logger.js";

const FILE_EXTENSION_SEPARATOR = ".";
const FIRST_ELEMENT = 0;
const JSON_FILE_EXTENSION = ".json";
const FILE_ENCODING = "utf-8";

function extractConsoleIdFromFilename(jsonSystemFile) {
  return jsonSystemFile.split(FILE_EXTENSION_SEPARATOR)[FIRST_ELEMENT];
}

function readJsonFiles(directoryPath) {
  try {
    if (!fs.existsSync(directoryPath)) {
      return [];
    }
    const systems = fs.readdirSync(directoryPath, { withFileTypes: true });
    return systems
      .filter(
        (dirent) =>
          dirent.isFile() && dirent.name.endsWith(JSON_FILE_EXTENSION),
      )
      .map((dirent) => dirent.name);
  } catch (err) {
    logger.error("Error reading directory:", err);
    return [];
  }
}

export function getArraySystemsJson() {
  const systemPath = getPathSystemJsonSystemsPC();
  return readJsonFiles(systemPath);
}

function parseRomsFromJsonFile(jsonFilePath) {
  try {
    const fileContent = fs.readFileSync(jsonFilePath, FILE_ENCODING);
    const romsData = JSON.parse(fileContent);
    return Object.values(romsData);
  } catch (err) {
    logger.error(`Error parsing JSON file ${jsonFilePath}:`, err);
    return [];
  }
}

function buildConsoleData(consoleId, roms) {
  return {
    consoleId,
    consoleName: consoleId.toUpperCase(),
    romCount: roms.length,
    roms: roms,
  };
}

function loadConsoleFromJsonFile(systemPath, jsonFile) {
  const consoleId = extractConsoleIdFromFilename(jsonFile);
  const jsonPath = path.join(systemPath, jsonFile);
  const roms = parseRomsFromJsonFile(jsonPath);
  return buildConsoleData(consoleId, roms);
}

function filterConsolesWithRoms(consoles) {
  return consoles.filter((console) => console.romCount > 0);
}

export function getGeneratedConsoles() {
  const systemPath = getPathSystemJsonSystemsPC();
  const systemsJson = getArraySystemsJson();

  const consoles = systemsJson.map((jsonFile) =>
    loadConsoleFromJsonFile(systemPath, jsonFile),
  );

  return filterConsolesWithRoms(consoles);
}
