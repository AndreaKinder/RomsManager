import { systemRomDecider } from "./getFilters.js";
import fs from "fs";
import path from "path";
import { getPathSystemJsonSystemsPC } from "./getPaths.js";

function getRegisterTemplate(templateData) {
  return {
    romName: templateData[0],
    system: templateData[1],
    title: templateData[2],
    romPath: templateData[3],
  };
}

function getTemplateData(romFinalPath) {
  const romName = path.basename(romFinalPath);
  const system = systemRomDecider(romName);
  const romTitle = romName.split(".")[0];
  return [romName, system, romTitle, romFinalPath];
}

export function getRegisterRomTemplate(romFinalPath) {
  const templateData = [...getTemplateData(romFinalPath)];
  return getRegisterTemplate(templateData);
}

function getJsonFilePath(consoleId) {
  const baseDir = getPathSystemJsonSystemsPC();
  return path.join(baseDir, `${consoleId}.json`);
}

function readExistingRomsData(jsonFilePath) {
  if (!fs.existsSync(jsonFilePath)) {
    return {};
  }

  const fileContent = fs.readFileSync(jsonFilePath, "utf-8");
  return JSON.parse(fileContent);
}

function addRomToCollection(romsData, romObject) {
  romsData[romObject.romName] = {
    romName: romObject.romName,
    system: romObject.system,
    title: romObject.title,
    romPath: romObject.romPath,
  };

  return romsData;
}

function writeRomsDataToFile(jsonFilePath, romsData) {
  const jsonContent = JSON.stringify(romsData, null, 2);
  fs.writeFileSync(jsonFilePath, jsonContent, "utf-8");
}

export function getWriteRomSystemJsonPC(romObject) {
  const jsonFilePath = getJsonFilePath(romObject.system);
  const romsData = readExistingRomsData(jsonFilePath);
  const updatedRomsData = addRomToCollection(romsData, romObject);

  writeRomsDataToFile(jsonFilePath, updatedRomsData);

  return updatedRomsData;
}
