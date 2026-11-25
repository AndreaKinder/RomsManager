import fs from "fs";
import path from "path";
import { getPathSystemJsonSystemsPC } from "./getPaths.js";
import { syncSystemGamelist } from "../emulationStationService.js";

const JSON_INDENT_SPACES = 2;
const JSON_FILE_EXTENSION = ".json";
const FILE_ENCODING = "utf-8";

function createRomObject(templateData) {
  return {
    romName: templateData[0],
    system: templateData[1],
    title: templateData[2],
    romPath: templateData[3],
  };
}

function extractRomMetadata(romFinalPath, system) {
  const romName = path.basename(romFinalPath);
  const romTitle = path.parse(romName).name || romName;
  return [romName, system, romTitle, romFinalPath];
}

export function createRomTemplate(romFinalPath, system) {
  const templateData = [...extractRomMetadata(romFinalPath, system)];
  return createRomObject(templateData);
}

function buildJsonFilePath(consoleId) {
  const baseDir = getPathSystemJsonSystemsPC();
  return path.join(baseDir, `${consoleId}${JSON_FILE_EXTENSION}`);
}

function readExistingRomsData(jsonFilePath) {
  if (!fs.existsSync(jsonFilePath)) {
    return {};
  }

  const fileContent = fs.readFileSync(jsonFilePath, FILE_ENCODING);
  return JSON.parse(fileContent);
}

function addRomToCollection(romsData, romObject) {
  const existing = romsData[romObject.romName] || {};
  romsData[romObject.romName] = {
    ...existing,
    romName: romObject.romName,
    system: romObject.system,
    title: romObject.title ?? existing.title ?? path.parse(romObject.romName).name,
    romPath: romObject.romPath,
    savePath: romObject.savePath !== undefined ? romObject.savePath : (existing.savePath || null),
    coverPath: romObject.coverPath !== undefined ? romObject.coverPath : (existing.coverPath || null),
    manualPath: romObject.manualPath !== undefined ? romObject.manualPath : (existing.manualPath || null),
    collections: romObject.collections !== undefined ? romObject.collections : (existing.collections || []),
    description: romObject.description !== undefined ? romObject.description : (existing.description || ""),
    developer: romObject.developer !== undefined ? romObject.developer : (existing.developer || ""),
    releaseDate: romObject.releaseDate !== undefined ? romObject.releaseDate : (existing.releaseDate || ""),
    ...(romObject.rommId !== undefined ? { rommId: romObject.rommId } : {}),
    ...(romObject.rommPlatformSlug !== undefined ? { rommPlatformSlug: romObject.rommPlatformSlug } : {}),
  };

  return romsData;
}

function writeRomsDataToFile(jsonFilePath, romsData) {
  fs.mkdirSync(path.dirname(jsonFilePath), { recursive: true });
  const jsonContent = JSON.stringify(romsData, null, JSON_INDENT_SPACES);
  fs.writeFileSync(jsonFilePath, jsonContent, FILE_ENCODING);
}

function getCandidateJsonFiles(baseDir, consoleId = null) {
  if (!fs.existsSync(baseDir)) return [];
  if (consoleId) {
    const specific = `${consoleId}${JSON_FILE_EXTENSION}`;
    if (fs.existsSync(path.join(baseDir, specific))) {
      return [specific];
    }
  }
  return fs
    .readdirSync(baseDir)
    .filter((f) => f.endsWith(JSON_FILE_EXTENSION));
}

export function persistRomToJson(romObject) {
  const jsonFilePath = buildJsonFilePath(romObject.system);
  const romsData = readExistingRomsData(jsonFilePath);
  const updatedRomsData = addRomToCollection(romsData, romObject);

  writeRomsDataToFile(jsonFilePath, updatedRomsData);

  try {
    syncSystemGamelist(romObject.system);
  } catch (esErr) {
    console.warn("Could not sync gamelist with EmulationStation:", esErr.message);
  }

  return updatedRomsData;
}

export function updateRomInJson(romName, fieldToUpdate, newValue, consoleId = null) {
  const baseDir = getPathSystemJsonSystemsPC();
  const jsonFiles = getCandidateJsonFiles(baseDir, consoleId);

  for (const jsonFile of jsonFiles) {
    const jsonFilePath = path.join(baseDir, jsonFile);
    const romsData = readExistingRomsData(jsonFilePath);
    const fileConsoleId = path.basename(jsonFile, JSON_FILE_EXTENSION);

    if (romsData[romName]) {
      const syncGamelist = () => {
        try {
          syncSystemGamelist(fileConsoleId);
        } catch (esErr) {
          console.warn("Could not sync gamelist with EmulationStation:", esErr.message);
        }
      };

      // Caso: actualizar campos simples (title, system, etc)
      if (fieldToUpdate !== "romName" && fieldToUpdate !== "romPath") {
        romsData[romName][fieldToUpdate] = newValue;
        writeRomsDataToFile(jsonFilePath, romsData);
        syncGamelist();
        return romsData[romName];
      }

      // Caso: actualizar romName
      if (fieldToUpdate === "romName") {
        const oldRomPath = romsData[romName].romPath;
        const newRomPath = path.join(path.dirname(oldRomPath), newValue);

        if (fs.existsSync(oldRomPath)) {
          fs.renameSync(oldRomPath, newRomPath);
        }

        const updatedRom = {
          ...romsData[romName],
          romName: newValue,
          romPath: newRomPath,
        };

        delete romsData[romName];
        romsData[newValue] = updatedRom;

        writeRomsDataToFile(jsonFilePath, romsData);
        syncGamelist();
        return updatedRom;
      }

      // Caso: actualizar romPath
      if (fieldToUpdate === "romPath") {
        const oldRomPath = romsData[romName].romPath;
        const newRomName = path.basename(newValue);

        if (fs.existsSync(oldRomPath)) {
          fs.renameSync(oldRomPath, newValue);
        }

        if (newRomName !== romName) {
          const updatedRom = {
            ...romsData[romName],
            romName: newRomName,
            romPath: newValue,
          };
          delete romsData[romName];
          romsData[newRomName] = updatedRom;
          writeRomsDataToFile(jsonFilePath, romsData);
          syncGamelist();
          return updatedRom;
        } else {
          romsData[romName].romPath = newValue;
          writeRomsDataToFile(jsonFilePath, romsData);
          syncGamelist();
          return romsData[romName];
        }
      }
    }
  }

  throw new Error(`ROM "${romName}" not found in any system`);
}

export function deleteRomFromJson(romName, consoleId = null) {
  const baseDir = getPathSystemJsonSystemsPC();
  const jsonFiles = getCandidateJsonFiles(baseDir, consoleId);

  for (const jsonFile of jsonFiles) {
    const jsonFilePath = path.join(baseDir, jsonFile);
    const romsData = readExistingRomsData(jsonFilePath);
    const fileConsoleId = path.basename(jsonFile, JSON_FILE_EXTENSION);

    if (romsData[romName]) {
      const { romPath, coverPath, manualPath } = romsData[romName];

      delete romsData[romName];
      writeRomsDataToFile(jsonFilePath, romsData);

      if (romPath && fs.existsSync(romPath)) {
        fs.unlinkSync(romPath);
      }
      if (coverPath && fs.existsSync(coverPath)) {
        try {
          fs.unlinkSync(coverPath);
        } catch {
          // Ignore cleanup errors for optional cover
        }
      }
      if (manualPath && fs.existsSync(manualPath)) {
        try {
          fs.unlinkSync(manualPath);
        } catch {
          // Ignore cleanup errors for optional manual
        }
      }

      try {
        syncSystemGamelist(fileConsoleId);
      } catch (esErr) {
        console.warn("Could not sync gamelist with EmulationStation:", esErr.message);
      }

      return { success: true, romName, romPath };
    }
  }

  throw new Error(`ROM "${romName}" not found in any system`);
}

export function updateRomCollections(romName, collections, consoleId = null) {
  const baseDir = getPathSystemJsonSystemsPC();
  const jsonFiles = getCandidateJsonFiles(baseDir, consoleId);

  for (const jsonFile of jsonFiles) {
    const jsonFilePath = path.join(baseDir, jsonFile);
    const romsData = readExistingRomsData(jsonFilePath);
    const fileConsoleId = path.basename(jsonFile, JSON_FILE_EXTENSION);

    if (romsData[romName]) {
      romsData[romName].collections = Array.isArray(collections)
        ? collections
        : [];
      writeRomsDataToFile(jsonFilePath, romsData);

      try {
        syncSystemGamelist(fileConsoleId);
      } catch (esErr) {
        console.warn("Could not sync gamelist with EmulationStation:", esErr.message);
      }

      return {
        success: true,
        romName,
        collections: romsData[romName].collections,
      };
    }
  }

  throw new Error(`ROM "${romName}" not found in any system`);
}
