import fs from "fs";
import path from "path";
import { systemRomDecider } from "./utils/getFilters.js";
import { getRomPathPC, getRomPathGalic } from "./utils/getPaths.js";
import { getSystemIdArray } from "./utils/getArrays.js";
import {
  getRegisterRomTemplate,
  getWriteRomSystemJsonPC,
} from "./utils/getJsonUtils.js";

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

function exportSingleRomPcToGalic(romPathPc, sdPath) {
  const romName = path.basename(romPathPc);
  const system = systemRomDecider(romName);
  if (!system) {
    console.log(`Skipping non-ROM file: ${romName}`);
    return null;
  }
  console.log(`Syncing ROM: ${romName} -> System: ${system}`);
  const romPathGalicDir = getRomPathGalic(sdPath, system);
  const romPathGalic = path.join(romPathGalicDir, romName);
  const destDir = path.dirname(romPathGalic);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(romPathPc, romPathGalic);
  console.log(`  Copied to: ${romPathGalic}`);
}

function exportRomsFromSystemPcToGalic(romPathPC, sdPath) {
  if (!fs.existsSync(romPathPC)) {
    console.log(`  Directory not found, skipping...`);
    return;
  }
  const files = fs.readdirSync(romPathPC);
  if (files.length === 0) {
    console.log(`  No files found`);
    return;
  }
  for (const file of files) {
    const filePath = path.join(romPathPC, file);
    if (fs.lstatSync(filePath).isDirectory()) continue;
    exportSingleRomPcToGalic(filePath, sdPath);
  }
}

export function exportAllRomsPcToGalic(sdPath) {
  console.log(`Starting ROM export from PC to SD: ${sdPath}`);
  const systemsArray = getSystemIdArray();
  console.log(`Systems found: ${systemsArray.join(", ")}`);
  for (const system of systemsArray) {
    console.log(`\nProcessing system: ${system}`);
    const systemRomPathPC = getRomPathPC(system, "dummy.rom");
    const systemDir = path.dirname(systemRomPathPC);
    console.log(`  Looking in: ${systemDir}`);
    exportRomsFromSystemPcToGalic(systemDir, sdPath);
  }
  console.log("\n✓ Export completed!");
}
