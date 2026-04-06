import fs from "fs";
import path from "path";
import os from "os";

const CONFIG_FILE = "config.json";
const CONFIG_DIR = ".config/romsmanager";

function getConfigPath() {
  if (process.platform === "win32") {
    return path.join(process.env.APPDATA, "romsmanager", CONFIG_FILE);
  }
  return path.join(os.homedir(), CONFIG_DIR, CONFIG_FILE);
}

function readConfig() {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch {
    return {};
  }
}

function writeConfig(config) {
  const configPath = getConfigPath();
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}

export function getRomsBasePath() {
  return readConfig().romsBasePath || null;
}

export function setRomsBasePath(basePath) {
  const config = readConfig();
  config.romsBasePath = basePath;
  writeConfig(config);
}

export function hasRomsBasePath() {
  return getRomsBasePath() !== null;
}
