import fs from "fs";
import path from "path";
import consolesData from "../data/consoles.json" with { type: "json" };
import { getPathSystemJsonSystemsPC } from "./utils/getPaths.js";
import logger from "./utils/logger.js";

const consoleNameMap = Object.values(consolesData.consoles).reduce(
  (map, c) => ({ ...map, [c.id_name]: c.name }),
  {},
);

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
    consoleName: consoleNameMap[consoleId] || consoleId.toUpperCase(),
    romCount: roms.length,
    roms: roms,
  };
}

function loadConsoleFromJsonFile(systemPath, jsonFile) {
  const consoleId = extractConsoleIdFromFilename(jsonFile);
  const jsonPath = path.join(systemPath, jsonFile);
  const roms = parseRomsFromJsonFile(jsonPath).map(fixCoverPath);
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

  if (fs.existsSync(rom.coverPath)) {
    return rom;
  }

  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
  const basePathWithoutExt = rom.coverPath.replace(/\.[^.]+$/, "");

  for (const ext of validExtensions) {
    const possiblePath = basePathWithoutExt + ext;
    if (fs.existsSync(possiblePath)) {
      logger.info(`Fixed cover path for ${rom.romName}: ${possiblePath}`);
      return { ...rom, coverPath: possiblePath };
    }
  }

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

function extractCustomCollectionsFromRoms(romsList) {
  if (!Array.isArray(romsList)) {
    return Array.isArray(romsList?.collections) ? romsList.collections : [];
  }
  const collectionsSet = new Set();
  for (const romObject of romsList) {
    if (Array.isArray(romObject?.collections)) {
      for (const col of romObject.collections) {
        collectionsSet.add(col);
      }
    }
  }
  return Array.from(collectionsSet);
}

function getRomForCustomCollection(romsObjectList, collection) {
  if (!Array.isArray(romsObjectList)) return [];
  const romsCollection = [];
  for (const romObject of romsObjectList) {
    if (
      Array.isArray(romObject?.collections) &&
      romObject.collections.includes(collection)
    ) {
      romsCollection.push(romObject);
    }
  }
  return romsCollection;
}

function createCollectionObject(roms, collection) {
  const collectionName = collection;
  return { collectionName, roms: getRomForCustomCollection(roms, collection) };
}

export function getCollectionObject(allObjectRoms) {
  const customCollections = {};
  const collections = extractCustomCollectionsFromRoms(allObjectRoms);
  collections.forEach((collection) => {
    const collectionObject = createCollectionObject(allObjectRoms, collection);
    customCollections[collection] = collectionObject;
  });
  return customCollections;
}

export function getAllCustomCollections(allObjectRoms) {
  const customCollections = getCollectionObject(allObjectRoms);
  const allCollections = Object.values(customCollections);
  return allCollections;
}
