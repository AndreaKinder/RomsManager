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


export function getDefaultInternalRomsPath() {
  const userHome = process.env.USERPROFILE || os.homedir();
  return path.join(userHome, "Roms");
}

export function getDatabasePath() {
  const config = readConfig();
  if (config.storageType === "external" && config.romsBasePath) {
    return path.join(config.romsBasePath, "database");
  }
  if (config.databasePath) {
    return config.databasePath;
  }
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

export function getStorageType() {
  return readConfig().storageType || null;
}

export function setStorageType(storageType) {
  const config = readConfig();
  config.storageType = storageType;
  writeConfig(config);
}

export function getSyncEmulationStation() {
  return Boolean(readConfig().syncEmulationStation);
}

export function setSyncEmulationStation(sync) {
  const config = readConfig();
  config.syncEmulationStation = Boolean(sync);
  writeConfig(config);
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
  const config = readConfig();
  return Boolean(config.romsBasePath && config.storageType);
}

export function getAppConfig() {
  const config = readConfig();
  return {
    storageType: config.storageType || "internal",
    romsBasePath: config.romsBasePath || null,
    syncEmulationStation: Boolean(config.syncEmulationStation),
    databasePath: getDatabasePath(),
  };
}

export function setAppConfig({ storageType, romsBasePath, syncEmulationStation }) {
  const config = readConfig();
  if (storageType !== undefined) config.storageType = storageType;
  if (romsBasePath !== undefined) config.romsBasePath = romsBasePath;
  if (syncEmulationStation !== undefined) {
    config.syncEmulationStation = Boolean(syncEmulationStation);
  }
  writeConfig(config);

  const dbPath = getDatabasePath();
  if (dbPath && !fs.existsSync(dbPath)) {
    try {
      fs.mkdirSync(dbPath, { recursive: true });
    } catch (e) {
      // Ignore if directory cannot be created immediately (e.g. mock or drive permissions)
    }
  }

  return getAppConfig();
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
