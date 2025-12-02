import fs from "fs";
import path from "path";
import { systemRomDecider } from "./utils/getFilters.js";
import { getRomPathPC, getRomPathGalic } from "./utils/getPaths.js";
import { getSystemIdArray } from "./utils/getArrays.js";
import {
  getRegisterRomTemplate,
  getWriteRomSystemJsonPC,
} from "./utils/getJsonRegisters.js";

function importSingleRomPC(romPath) {
  const romName = path.basename(romPath);
  const system = systemRomDecider(romName);
  if (!system) {
    console.log(`Skipping non-ROM file: ${romName}`);
    return null;
  }
  console.log(`Syncing ROM: ${romName} -> System: ${system}`);
  const romPathPC = getRomPathPC(system, romName);
  const destDir = path.dirname(romPathPC);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(romPath, romPathPC);
  console.log(`  Copied to: ${romPathPC}`);
  return getRegisterRomTemplate(romPathPC);
}

function importRomsToSystemPC(romPath) {
  if (!fs.existsSync(romPath)) {
    console.log(`  Directory not found, skipping...`);
    return;
  }
  const files = fs.readdirSync(romPath);
  if (files.length === 0) {
    console.log(`  No files found`);
    return;
  }
  for (const file of files) {
    const filePath = path.join(romPath, file);
    if (fs.lstatSync(filePath).isDirectory()) continue;
    const romData = importSingleRomPC(filePath);
    if (romData) {
      getWriteRomSystemJsonPC(romData);
    }
  }
}

export function importRomsPC(sdPath) {
  console.log(`Starting ROM sync from SD: ${sdPath}`);
  const systemsArray = getSystemIdArray();
  console.log(`Systems found: ${systemsArray.join(", ")}`);
  for (const system of systemsArray) {
    console.log(`\nProcessing system: ${system}`);
    const romPath = getRomPathGalic(sdPath, system);
    console.log(`  Looking in: ${romPath}`);
    importRomsToSystemPC(romPath);
  }
  console.log("\n✓ Sync completed!");
}

export function importRomsSD(sdPath) {
  console.log(`Starting ROM import from SD: ${sdPath}`);
  const systemsArray = getSystemIdArray();
  console.log(`Systems found: ${systemsArray.join(", ")}`);
  for (const system of systemsArray) {
    console.log(`\nProcessing system: ${system}`);
    const romPath = getRomPathGalic(sdPath, system);
    console.log(`  Looking in: ${romPath}`);
    importRomsToSystemPC(romPath);
  }
  console.log("\n✓ Import from SD completed!");
}

function exportSingleRomToSD(romPath, sdPath) {
  const romName = path.basename(romPath);
  const system = systemRomDecider(romName);
  if (!system) {
    console.log(`Skipping non-ROM file: ${romName}`);
    return null;
  }
  console.log(`Exporting ROM: ${romName} -> System: ${system}`);
  const romPathSD = path.join(getRomPathGalic(sdPath, system), romName);
  const destDir = path.dirname(romPathSD);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(romPath, romPathSD);
  console.log(`  Copied to: ${romPathSD}`);
  return romName;
}

function exportRomsFromSystemToSD(systemId, sdPath) {
  const pcRomPath = `C:/Users/andre/Documents/Roms/${systemId}`;
  if (!fs.existsSync(pcRomPath)) {
    console.log(`  PC directory not found, skipping...`);
    return;
  }
  const files = fs.readdirSync(pcRomPath);
  if (files.length === 0) {
    console.log(`  No files found`);
    return;
  }
  for (const file of files) {
    const filePath = path.join(pcRomPath, file);
    if (fs.lstatSync(filePath).isDirectory()) continue;
    exportSingleRomToSD(filePath, sdPath);
  }
}

export function exportRomsToSD(sdPath) {
  console.log(`Starting ROM export to SD: ${sdPath}`);
  const systemsArray = getSystemIdArray();
  console.log(`Systems found: ${systemsArray.join(", ")}`);
  for (const system of systemsArray) {
    console.log(`\nProcessing system: ${system}`);
    exportRomsFromSystemToSD(system, sdPath);
  }
  console.log("\n✓ Export to SD completed!");
}
