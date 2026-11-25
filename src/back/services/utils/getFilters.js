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
  if (!romFileExtension) return undefined;
  const normalized = romFileExtension.toLowerCase();
  return Object.values(consolesData.consoles).find((console) =>
    console.file.includes(`.${normalized}`),
  )?.id_name;
}

export function identifyRomSystem(romFileName) {
  const extension = extractFileExtension(romFileName);
  return findSystemByExtension(extension);
}

/**
 * Resolves a folder name or RomM platform slug (e.g. "psx", "snes", "ngc")
 * to a canonical RomsManager console id_name (e.g. "ps", "sfc", "gc").
 */
export function resolveConsoleIdFromAlias(folderOrSlug) {
  if (!folderOrSlug || typeof folderOrSlug !== "string") return null;
  const normalized = folderOrSlug.trim().toLowerCase();
  for (const consoleEntry of Object.values(consolesData.consoles)) {
    if (consoleEntry.id_name.toLowerCase() === normalized) {
      return consoleEntry.id_name;
    }
    if (
      Array.isArray(consoleEntry.aliases) &&
      consoleEntry.aliases.some((a) => a.toLowerCase() === normalized)
    ) {
      return consoleEntry.id_name;
    }
  }
  return null;
}

export function isValidExtensionForConsole(fileName, consoleId) {
  const ext = extractFileExtension(fileName);
  if (!ext) return false;
  const allowed = getExtensionsBySystemId(consoleId);
  if (!allowed || allowed.length === 0) return true;
  return allowed.includes(`.${ext}`);
}
