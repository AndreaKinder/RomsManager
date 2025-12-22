import { systemRomDecider } from "./getFilters.js";
import fs from "fs";
import path from "path";
import { getPathSystemJsonSystemsPC } from "./getPaths.js";

const FILE_EXTENSION_SEPARATOR = ".";
const FIRST_ELEMENT = 0;
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

function extractRomMetadata(romFinalPath) {
  const romName = path.basename(romFinalPath);
  const system = systemRomDecider(romName);
  const romTitle = romName.split(FILE_EXTENSION_SEPARATOR)[FIRST_ELEMENT];
  return [romName, system, romTitle, romFinalPath];
}

export function createRomTemplate(romFinalPath) {
  const templateData = [...extractRomMetadata(romFinalPath)];
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
  romsData[romObject.romName] = {
    romName: romObject.romName,
    system: romObject.system,
    title: romObject.title,
    romPath: romObject.romPath,
    savePath: romObject.savePath || null,
    coverPath: romObject.coverPath || null,
    collections: romObject.collections || [],
  };

  return romsData;
}

function writeRomsDataToFile(jsonFilePath, romsData) {
  const jsonContent = JSON.stringify(romsData, null, JSON_INDENT_SPACES);
  fs.writeFileSync(jsonFilePath, jsonContent, FILE_ENCODING);
}

export function persistRomToJson(romObject) {
  const jsonFilePath = buildJsonFilePath(romObject.system);
  const romsData = readExistingRomsData(jsonFilePath);
  const updatedRomsData = addRomToCollection(romsData, romObject);

  writeRomsDataToFile(jsonFilePath, updatedRomsData);

  return updatedRomsData;
}

export function updateRomInJson(romName, fieldToUpdate, newValue) {
  const baseDir = getPathSystemJsonSystemsPC();
  const jsonFiles = fs
    .readdirSync(baseDir)
    .filter((f) => f.endsWith(JSON_FILE_EXTENSION));

  for (const jsonFile of jsonFiles) {
    const jsonFilePath = path.join(baseDir, jsonFile);
    const romsData = readExistingRomsData(jsonFilePath);

    if (romsData[romName]) {
      // Caso: actualizar campos simples (title, system, etc)
      if (fieldToUpdate !== "romName" && fieldToUpdate !== "romPath") {
        romsData[romName][fieldToUpdate] = newValue;
        writeRomsDataToFile(jsonFilePath, romsData);
        return romsData[romName];
      }

      // Caso: actualizar romName
      if (fieldToUpdate === "romName") {
        const oldRomPath = romsData[romName].romPath;
        const newRomPath = path.join(path.dirname(oldRomPath), newValue);

        // Renombrar archivo físico si existe
        if (fs.existsSync(oldRomPath)) {
          fs.renameSync(oldRomPath, newRomPath);
        }

        // Crear nueva entrada con el nuevo nombre
        const updatedRom = {
          ...romsData[romName],
          romName: newValue,
          romPath: newRomPath,
        };

        // Eliminar entrada vieja y agregar nueva
        delete romsData[romName];
        romsData[newValue] = updatedRom;

        writeRomsDataToFile(jsonFilePath, romsData);
        return updatedRom;
      }

      // Caso: actualizar romPath
      if (fieldToUpdate === "romPath") {
        const oldRomPath = romsData[romName].romPath;
        const newRomName = path.basename(newValue);

        // Renombrar archivo físico si existe
        if (fs.existsSync(oldRomPath)) {
          fs.renameSync(oldRomPath, newValue);
        }

        // Actualizar o recrear entrada según si cambió el nombre
        if (newRomName !== romName) {
          const updatedRom = {
            ...romsData[romName],
            romName: newRomName,
            romPath: newValue,
          };
          delete romsData[romName];
          romsData[newRomName] = updatedRom;
          writeRomsDataToFile(jsonFilePath, romsData);
          return updatedRom;
        } else {
          romsData[romName].romPath = newValue;
          writeRomsDataToFile(jsonFilePath, romsData);
          return romsData[romName];
        }
      }
    }
  }

  throw new Error(`ROM "${romName}" not found in any system`);
}

export function deleteRomFromJson(romName) {
  const baseDir = getPathSystemJsonSystemsPC();
  const jsonFiles = fs
    .readdirSync(baseDir)
    .filter((f) => f.endsWith(JSON_FILE_EXTENSION));

  for (const jsonFile of jsonFiles) {
    const jsonFilePath = path.join(baseDir, jsonFile);
    const romsData = readExistingRomsData(jsonFilePath);

    if (romsData[romName]) {
      const romPath = romsData[romName].romPath;

      // Delete ROM entry from JSON
      delete romsData[romName];
      writeRomsDataToFile(jsonFilePath, romsData);

      // Delete physical ROM file if it exists
      if (fs.existsSync(romPath)) {
        fs.unlinkSync(romPath);
      }

      return { success: true, romName, romPath };
    }
  }

  throw new Error(`ROM "${romName}" not found in any system`);
}

export function updateRomCollections(romName, collections) {
  const baseDir = getPathSystemJsonSystemsPC();
  const jsonFiles = fs
    .readdirSync(baseDir)
    .filter((f) => f.endsWith(JSON_FILE_EXTENSION));

  for (const jsonFile of jsonFiles) {
    const jsonFilePath = path.join(baseDir, jsonFile);
    const romsData = readExistingRomsData(jsonFilePath);

    if (romsData[romName]) {
      // Update collections field
      romsData[romName].collections = Array.isArray(collections)
        ? collections
        : [];
      writeRomsDataToFile(jsonFilePath, romsData);
      return {
        success: true,
        romName,
        collections: romsData[romName].collections,
      };
    }
  }

  throw new Error(`ROM "${romName}" not found in any system`);
}

// Deprecated aliases for backward compatibility
export const getRegisterRomTemplate = createRomTemplate;
export const getWriteRomSystemJsonPC = persistRomToJson;
export const getEditRomSystemJsonPC = updateRomInJson;
export const getDeleteRomSystemJsonPC = deleteRomFromJson;
