import path from "path";
import consolesData from "../../data/consoles.json" with { type: "json" };
import {
  getRomsBasePath,
  getDatabasePath,
  getPathLayout,
} from "../configService.js";

function getBaseRomsPath() {
  const configured = getRomsBasePath();
  if (configured) return configured;
  const userHome = process.env.USERPROFILE || process.env.HOME || "";
  return path.join(userHome, "Roms");
}

function getConsoleFolderName(consoleId, layout) {
  const override = layout?.consoleOverrides?.[consoleId];
  if (override?.folderName && override.folderName.trim()) {
    return override.folderName.trim();
  }
  return consoleId;
}

function resolveTemplate(pattern, base, consoleFolder) {
  const replaced = pattern
    .replace(/\{base\}/g, base)
    .replace(/\{console\}/g, consoleFolder);
  return path.normalize(replaced);
}

export function getRomsDirPC(consoleId) {
  const layout = getPathLayout();
  const override = layout.consoleOverrides?.[consoleId];
  if (override?.romsDir && override.romsDir.trim()) {
    return path.normalize(override.romsDir.trim());
  }
  const base = getBaseRomsPath();
  const folder = getConsoleFolderName(consoleId, layout);
  return resolveTemplate(layout.romsPattern, base, folder);
}

export function getSavesDirPC(consoleId) {
  const layout = getPathLayout();
  const override = layout.consoleOverrides?.[consoleId];
  if (override?.savesDir && override.savesDir.trim()) {
    return path.normalize(override.savesDir.trim());
  }
  const base = getBaseRomsPath();
  const folder = getConsoleFolderName(consoleId, layout);
  return resolveTemplate(layout.savesPattern, base, folder);
}

export function getStatesDirPC(consoleId) {
  const layout = getPathLayout();
  const override = layout.consoleOverrides?.[consoleId];
  if (override?.statesDir && override.statesDir.trim()) {
    return path.normalize(override.statesDir.trim());
  }
  const base = getBaseRomsPath();
  const folder = getConsoleFolderName(consoleId, layout);
  return resolveTemplate(layout.statesPattern, base, folder);
}

export function getCoversDirPC(consoleId) {
  const layout = getPathLayout();
  const override = layout.consoleOverrides?.[consoleId];
  if (override?.coversDir && override.coversDir.trim()) {
    return path.normalize(override.coversDir.trim());
  }
  const base = getBaseRomsPath();
  const folder = getConsoleFolderName(consoleId, layout);
  return resolveTemplate(layout.coversPattern, base, folder);
}

export function getManualsDirPC(consoleId) {
  const layout = getPathLayout();
  const override = layout.consoleOverrides?.[consoleId];
  if (override?.manualsDir && override.manualsDir.trim()) {
    return path.normalize(override.manualsDir.trim());
  }
  const base = getBaseRomsPath();
  const folder = getConsoleFolderName(consoleId, layout);
  return resolveTemplate(layout.manualsPattern, base, folder);
}

function getDefaultSaveExtension(consoleId) {
  const entry = Object.values(consolesData.consoles).find(
    (c) => c.id_name === consoleId,
  );
  return entry?.save_formats?.[0] || ".sav";
}

export function getRomPathGalic(sdPath, consoleId) {
  return `${sdPath}/Roms/${consoleId.toUpperCase()}`;
}

export function getCoverPathGalic(consoleId) {
  return `Roms/${consoleId}/Imgs`;
}

export function getXmlPathGalic(consoleId) {
  return `Roms/${consoleId}/gamelist.xml`;
}

export function getRomPathPC(consoleId, romFileName) {
  return path.join(getRomsDirPC(consoleId), romFileName);
}

export function getPathSystemJsonSystemsPC() {
  return getDatabasePath();
}

export function getSavePathPC(consoleId, romFileName, saveExtension = null) {
  const romNameWithoutExt = romFileName.replace(/\.[^.]+$/, "");
  let ext = saveExtension || getDefaultSaveExtension(consoleId);
  if (ext && !ext.startsWith(".")) {
    ext = `.${ext}`;
  }
  return path.join(getSavesDirPC(consoleId), `${romNameWithoutExt}${ext}`);
}

export function getCoverPathPC(consoleId, romFileName, imageExtension) {
  const romNameWithoutExt = romFileName.replace(/\.[^.]+$/, "");
  return path.join(
    getCoversDirPC(consoleId),
    `${romNameWithoutExt}${imageExtension}`,
  );
}

export function getManualPathPC(consoleId, romFileName) {
  const romNameWithoutExt = romFileName.replace(/\.[^.]+$/, "");
  return path.join(getManualsDirPC(consoleId), `${romNameWithoutExt}.pdf`);
}
