import { getEditRomSystemJsonPC } from "./utils/getJsonUtils";

export function editRomTitle(romName, newRomTitle) {
  return getEditRomSystemJsonPC(romName, "title", newRomTitle);
}
