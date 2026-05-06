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


export function getDatabasePath() {
  if (process.platform === "win32") {
    return path.join(process.env.APPDATA, "romsmanager", "database");
  }
  return path.join(os.homedir(), CONFIG_DIR, "database");
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

export function getEmulators() {
  return readConfig().emulators || {};
}

export function getEmulatorForConsole(consoleId) {
  return getEmulators()[consoleId] || null;
}

export function setEmulator(consoleId, emulatorPath) {
  const config = readConfig();
  if (!config.emulators) config.emulators = {};
  config.emulators[consoleId] = emulatorPath;
  writeConfig(config);
}

export function removeEmulator(consoleId) {
  const config = readConfig();
  if (config.emulators) {
    delete config.emulators[consoleId];
    writeConfig(config);
  }
}

export function getScraperConfig() {
  return readConfig().scraper || {
    defaultScraper: "screenscraper",
    credentials: {
      screenscraper: { developerId: "", developerPassword: "", userId: "", userPassword: "" },
      thegamesdb: { apiKey: "" },
      igdb: { clientId: "", clientSecret: "" }
    }
  };
}

export function setScraperConfig(scraperConfig) {
  const config = readConfig();
  config.scraper = scraperConfig;
  writeConfig(config);
}
