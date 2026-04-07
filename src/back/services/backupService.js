import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { getDatabasePath, getRomsBasePath } from "./configService.js";

// ~/.config/romsmanager  (or %APPDATA%/romsmanager on Windows)
function getAppConfigDir() {
  return path.dirname(getDatabasePath());
}

function buildTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
}

export function exportBackup(destinationPath) {
  const zip = new AdmZip();

  const databaseDir = getDatabasePath();
  if (fs.existsSync(databaseDir)) {
    zip.addLocalFolder(databaseDir, "database");
  }

  const romsBasePath = getRomsBasePath();
  if (romsBasePath && fs.existsSync(romsBasePath)) {
    zip.addLocalFolder(romsBasePath, "roms");
  }

  fs.mkdirSync(destinationPath, { recursive: true });

  const fileName = `rommanager-backup-${buildTimestamp()}.zip`;
  const outputPath = path.join(destinationPath, fileName);

  zip.writeZip(outputPath);

  return outputPath;
}

export function importBackup(zipPath) {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();

  const appConfigDir = getAppConfigDir();
  const romsBasePath = getRomsBasePath();

  for (const entry of entries) {
    if (entry.isDirectory) continue;

    if (entry.entryName.startsWith("database/")) {
      const relative = entry.entryName.slice("database/".length);
      const target = path.join(appConfigDir, "database", relative);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, entry.getData());
    } else if (entry.entryName.startsWith("roms/") && romsBasePath) {
      const relative = entry.entryName.slice("roms/".length);
      const target = path.join(romsBasePath, relative);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, entry.getData());
    }
  }
}
