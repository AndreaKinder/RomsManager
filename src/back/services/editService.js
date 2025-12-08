import { updateRomInJson } from "./utils/getJsonUtils.js";

export function editRomTitle(romName, newRomTitle) {
  return updateRomInJson(romName, "title", newRomTitle);
}
