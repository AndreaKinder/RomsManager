import consolesData from "../../data/consoles.json" with { type: "json" };

export function getExtensionRomFile(romFileName) {
  const idx = romFileName.lastIndexOf(".");
  return idx === -1 ? "" : romFileName.slice(idx + 1).toLowerCase();
}

export function getArrayExtensionRomSystems(systemId) {
  const consoles = consolesData.consoles;
  for (const key in consoles) {
    if (consoles[key].id_name === systemId) {
      return consoles[key].file;
    }
  }
}

export function getSystemIdFromRomExtension(romFileExtension) {
  const consoles = consolesData.consoles;
  for (const key in consoles) {
    if (consoles[key].file.includes(`.${romFileExtension}`)) {
      return consoles[key].id_name;
    }
  }
}

export function systemRomDecider(romFileName) {
  const extension = getExtensionRomFile(romFileName);
  return getSystemIdFromRomExtension(extension);
}
