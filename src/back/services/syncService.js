import fs from "fs";
import path from "path";
import { identifyRomSystem } from "./utils/getFilters.js";
import { getRomPathPC, getRomPathGalic } from "./utils/getPaths.js";
import { getSystemIdArray } from "./utils/getArrays.js";
import { createRomTemplate, persistRomToJson } from "./utils/getJsonUtils.js";
import logger from "./utils/logger.js";

// Generic function to sync a single ROM file
function syncSingleRom(sourcePath, destinationPath, shouldRegister = false) {
  const romName = path.basename(sourcePath);
  const system = identifyRomSystem(romName);

  if (!system) {
    logger.skippingFile(romName);
    return null;
  }

  logger.syncingRom(romName, system);

  const destDir = path.dirname(destinationPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.copyFileSync(sourcePath, destinationPath);
  logger.copiedTo(destinationPath);

  if (shouldRegister) {
    return createRomTemplate(destinationPath);
  }

  return null;
}

// Generic function to sync all ROMs from a directory
function syncRomsFromDirectory(
  sourceDir,
  getDestinationPath,
  shouldRegister = false,
) {
  if (!fs.existsSync(sourceDir)) {
    logger.directoryNotFound();
    return;
  }

  const files = fs.readdirSync(sourceDir);
  if (files.length === 0) {
    logger.noFilesFound();
    return;
  }

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    if (fs.lstatSync(sourcePath).isDirectory()) continue;

    const destinationPath = getDestinationPath(sourcePath);
    const romData = syncSingleRom(sourcePath, destinationPath, shouldRegister);

    if (romData && shouldRegister) {
      persistRomToJson(romData);
    }
  }
}

// Import ROMs from SD card to PC
export function importRomsPC(sdPath) {
  logger.syncStart(sdPath);
  const systemsArray = getSystemIdArray();
  logger.systemsFound(systemsArray);

  for (const system of systemsArray) {
    logger.processingSystem(system);
    const sourceDir = getRomPathGalic(sdPath, system);
    logger.lookingInDirectory(sourceDir);

    syncRomsFromDirectory(
      sourceDir,
      (sourcePath) => {
        const romName = path.basename(sourcePath);
        return getRomPathPC(system, romName);
      },
      true, // Register imported ROMs
    );
  }

  logger.syncComplete();
}

// Export ROMs from PC to SD card
export function exportAllRomsPcToGalic(sdPath) {
  logger.exportStart(sdPath);
  const systemsArray = getSystemIdArray();
  logger.systemsFound(systemsArray);

  for (const system of systemsArray) {
    logger.processingSystem(system);
    const systemRomPathPC = getRomPathPC(system, "dummy.rom");
    const sourceDir = path.dirname(systemRomPathPC);
    logger.lookingInDirectory(sourceDir);

    syncRomsFromDirectory(
      sourceDir,
      (sourcePath) => {
        const romName = path.basename(sourcePath);
        const romPathGalicDir = getRomPathGalic(sdPath, system);
        return path.join(romPathGalicDir, romName);
      },
      false, // Don't register exported ROMs
    );
  }

  logger.exportComplete();
}
