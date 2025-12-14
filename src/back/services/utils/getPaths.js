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
  const userHome = process.env.USERPROFILE || process.env.HOME;
  return `${userHome}/Roms/Roms/${consoleId}/${romFileName}`;
}

export function getPathSystemJsonSystemsPC() {
  const userHome = process.env.USERPROFILE || process.env.HOME;
  return `${userHome}/Roms/Json`;
}

export function getSavePathPC(consoleId, romFileName) {
  const userHome = process.env.USERPROFILE || process.env.HOME;
  const romNameWithoutExt = romFileName.replace(/\.[^.]+$/, "");
  return `${userHome}/Roms/Saves/${consoleId}/${romNameWithoutExt}.sav`;
}

export function getCoverPathPC(consoleId, romFileName, imageExtension) {
  const userHome = process.env.USERPROFILE || process.env.HOME;
  const romNameWithoutExt = romFileName.replace(/\.[^.]+$/, "");
  return `${userHome}/Roms/Covers/${consoleId}/${romNameWithoutExt}${imageExtension}`;
}
