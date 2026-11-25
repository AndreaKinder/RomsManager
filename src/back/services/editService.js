import { updateRomInJson } from "./utils/getJsonUtils.js";

export function editRomTitle(romName, newRomTitle, consoleId = null) {
  return updateRomInJson(romName, "title", newRomTitle, consoleId);
}

export function editRomName(romName, newRomName, consoleId = null) {
  return updateRomInJson(romName, "romName", newRomName, consoleId);
}
