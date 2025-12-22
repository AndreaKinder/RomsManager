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

function fixCoverPath(rom) {
  if (!rom.coverPath) {
    return rom;
  }

  // Check if the cover file exists
  if (fs.existsSync(rom.coverPath)) {
    return rom;
  }

  // Cover doesn't exist, try to find it with different extensions
  console.log(`Cover file not found: ${rom.coverPath}`);
  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
  const basePathWithoutExt = rom.coverPath.replace(/\.[^.]+$/, "");
  console.log(`Searching for covers with base path: ${basePathWithoutExt}`);

  for (const ext of validExtensions) {
    const possiblePath = basePathWithoutExt + ext;
    console.log(`Trying: ${possiblePath}`);
    if (fs.existsSync(possiblePath)) {
      console.log(`✓ Found cover: ${possiblePath}`);
      logger.info(`Fixed cover path for ${rom.romName}: ${possiblePath}`);
      return { ...rom, coverPath: possiblePath };
    }
  }

  // No cover found, return with null coverPath
  console.log(`No cover found for ${rom.romName}`);
  logger.warn(`Cover not found for ${rom.romName}, expected: ${rom.coverPath}`);
  return { ...rom, coverPath: null };
}

export function getAllRoms() {
  const systemPath = getPathSystemJsonSystemsPC();
  const systemsJson = getArraySystemsJson();

  const allRoms = {};

  systemsJson.forEach((jsonFile) => {
    const consoleId = extractConsoleIdFromFilename(jsonFile);
    const jsonPath = path.join(systemPath, jsonFile);
    const roms = parseRomsFromJsonFile(jsonPath);
    if (roms.length > 0) {
      const fixedRoms = roms.map(fixCoverPath);
      allRoms[consoleId] = fixedRoms;
    }
  });

  return allRoms;
}
