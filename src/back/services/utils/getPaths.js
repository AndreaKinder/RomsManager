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
  return `C:/Users/andre/Documents/Roms/Roms/${consoleId}/${romFileName}`;
}

export function getPathSystemJsonSystemsPC() {
  return `C:/Users/andre/Documents/Roms/Json`;
}
