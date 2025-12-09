import { updateRomInJson } from "./utils/getJsonUtils.js";
import fs from "fs";
import path from "path";
import { getPathSystemJsonSystemsPC } from "./utils/getPaths.js";

const JSON_FILE_EXTENSION = ".json";
const FILE_ENCODING = "utf-8";
const JSON_INDENT_SPACES = 2;

export function editRomTitle(romName, newRomTitle) {
  return updateRomInJson(romName, "title", newRomTitle);
}

export function editRomName(romName, newRomName) {
  updateRomInJson(romName, "romName", newRomName);
}
