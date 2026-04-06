import { getRomsBasePath } from "../configService.js";

function getBaseRomsPath() {
  const configured = getRomsBasePath();
  if (configured) return configured;
  const userHome = process.env.USERPROFILE || process.env.HOME;
  return `${userHome}/Roms`;
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
  return `${getBaseRomsPath()}/Roms/${consoleId}/${romFileName}`;
}

export function getPathSystemJsonSystemsPC() {
  return `${getBaseRomsPath()}/Json`;
}

export function getSavePathPC(consoleId, romFileName) {
  const romNameWithoutExt = romFileName.replace(/\.[^.]+$/, "");
  return `${getBaseRomsPath()}/Saves/${consoleId}/${romNameWithoutExt}.sav`;
}

export function getCoverPathPC(consoleId, romFileName, imageExtension) {
  const romNameWithoutExt = romFileName.replace(/\.[^.]+$/, "");
  return `${getBaseRomsPath()}/Covers/${consoleId}/${romNameWithoutExt}${imageExtension}`;
}

export function getManualPathPC(consoleId, romFileName) {
  const romNameWithoutExt = romFileName.replace(/\.[^.]+$/, "");
  return `${getBaseRomsPath()}/Manuals/${consoleId}/${romNameWithoutExt}.pdf`;
}
