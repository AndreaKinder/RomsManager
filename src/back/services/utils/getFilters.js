import consolesData from "../../data/consoles.json" with { type: "json" };

const FILE_EXTENSION_SEPARATOR = ".";
const NO_EXTENSION = "";
const EXTENSION_NOT_FOUND = -1;

export function extractFileExtension(romFileName) {
  const idx = romFileName.lastIndexOf(FILE_EXTENSION_SEPARATOR);
  return idx === EXTENSION_NOT_FOUND
    ? NO_EXTENSION
    : romFileName.slice(idx + 1).toLowerCase();
}

export function getExtensionsBySystemId(systemId) {
  return Object.values(consolesData.consoles).find(
    (console) => console.id_name === systemId,
  )?.file;
}

export function findSystemByExtension(romFileExtension) {
  return Object.values(consolesData.consoles).find((console) =>
    console.file.includes(`.${romFileExtension}`),
  )?.id_name;
}

export function identifyRomSystem(romFileName) {
  const extension = extractFileExtension(romFileName);
  return findSystemByExtension(extension);
}

// Deprecated: Use identifyRomSystem instead
export const systemRomDecider = identifyRomSystem;
export const getExtensionRomFile = extractFileExtension;
export const getArrayExtensionRomSystems = getExtensionsBySystemId;
export const getSystemIdFromRomExtension = findSystemByExtension;
