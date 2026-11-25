import fs from "fs";
import path from "path";
import os from "os";

const CONFIG_FILE = "config.json";
const CONFIG_DIR = ".config/romsmanager";

export const PATH_LAYOUT_PRESETS = {
  standard: {
    id: "standard",
    label: "ROM Manager (Estándar)",
    romsPattern: "{base}/Roms/{console}",
    savesPattern: "{base}/Saves/{console}",
    statesPattern: "{base}/States/{console}",
    coversPattern: "{base}/Covers/{console}",
    manualsPattern: "{base}/Manuals/{console}",
  },
  romm: {
    id: "romm",
    label: "RomM / RommDeck",
    romsPattern: "{base}/{console}/games",
    savesPattern: "{base}/{console}/saves",
    statesPattern: "{base}/{console}/states",
    coversPattern: "{base}/{console}/covers",
    manualsPattern: "{base}/{console}/manuals",
  },
  emulationstation: {
    id: "emulationstation",
    label: "EmulationStation / ES-DE / EmuDeck",
    romsPattern: "{base}/roms/{console}",
    savesPattern: "{base}/saves/{console}",
    statesPattern: "{base}/states/{console}",
    coversPattern: "{base}/downloaded_media/{console}/covers",
    manualsPattern: "{base}/downloaded_media/{console}/manuals",
  },
};

export function getDefaultPathLayout() {
  const preset = PATH_LAYOUT_PRESETS.standard;
  return {
    preset: preset.id,
    romsPattern: preset.romsPattern,
    savesPattern: preset.savesPattern,
    statesPattern: preset.statesPattern,
    coversPattern: preset.coversPattern,
    manualsPattern: preset.manualsPattern,
    consoleOverrides: {},
  };
}

export function getDefaultRommConfig() {
  return {
    enabled: false,
    serverUrl: "",
    authType: "token", // "token" | "basic"
    apiToken: "",
    username: "",
    password: "",
    tlsVerify: true,
    platformMap: {}, // { [rommSlug]: localConsoleId }
    autoSyncSaves: false,
    syncMetadata: true,
    autoDownloadCovers: true,
  };
}

export function getConfigDirectory() {
  if (process.env.ROMSMANAGER_CONFIG_DIR) {
    return process.env.ROMSMANAGER_CONFIG_DIR;
  }
  if (process.platform === "win32") {
    return path.join(process.env.APPDATA || os.homedir(), "romsmanager");
  }
  return path.join(os.homedir(), CONFIG_DIR);
}

function getConfigPath() {
  return path.join(getConfigDirectory(), CONFIG_FILE);
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
  return path.join(getConfigDirectory(), "database");
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

export function getPathLayout() {
  const config = readConfig();
  const defaults = getDefaultPathLayout();
  const stored = config.pathLayout || {};
  const presetKey = stored.preset || defaults.preset;
  const presetDefaults = PATH_LAYOUT_PRESETS[presetKey] || defaults;

  return {
    preset: presetKey,
    romsPattern: stored.romsPattern || presetDefaults.romsPattern,
    savesPattern: stored.savesPattern || presetDefaults.savesPattern,
    statesPattern: stored.statesPattern || presetDefaults.statesPattern,
    coversPattern: stored.coversPattern || presetDefaults.coversPattern,
    manualsPattern: stored.manualsPattern || presetDefaults.manualsPattern,
    consoleOverrides: stored.consoleOverrides || {},
  };
}

export function setPathLayout(layoutUpdate = {}) {
  const config = readConfig();
  const current = getPathLayout();

  let next = { ...current, ...layoutUpdate };
  if (
    layoutUpdate.preset &&
    layoutUpdate.preset !== "custom" &&
    PATH_LAYOUT_PRESETS[layoutUpdate.preset] &&
    !layoutUpdate.romsPattern
  ) {
    const preset = PATH_LAYOUT_PRESETS[layoutUpdate.preset];
    next = {
      ...next,
      romsPattern: preset.romsPattern,
      savesPattern: preset.savesPattern,
      statesPattern: preset.statesPattern,
      coversPattern: preset.coversPattern,
      manualsPattern: preset.manualsPattern,
    };
  }

  if (layoutUpdate.consoleOverrides !== undefined) {
    next.consoleOverrides = layoutUpdate.consoleOverrides || {};
  }

  config.pathLayout = next;
  writeConfig(config);
  return getPathLayout();
}

export function getAppConfig() {
  const config = readConfig();
  return {
    storageType: config.storageType || "internal",
    romsBasePath: config.romsBasePath || null,
    syncEmulationStation: Boolean(config.syncEmulationStation),
    databasePath: getDatabasePath(),
    pathLayout: getPathLayout(),
  };
}

export function setAppConfig({
  storageType,
  romsBasePath,
  syncEmulationStation,
  pathLayout,
}) {
  const config = readConfig();
  if (storageType !== undefined) config.storageType = storageType;
  if (romsBasePath !== undefined) config.romsBasePath = romsBasePath;
  if (syncEmulationStation !== undefined) {
    config.syncEmulationStation = Boolean(syncEmulationStation);
  }
  if (pathLayout !== undefined) {
    const basePreset =
      pathLayout.preset && PATH_LAYOUT_PRESETS[pathLayout.preset]
        ? PATH_LAYOUT_PRESETS[pathLayout.preset]
        : getDefaultPathLayout();
    config.pathLayout = {
      preset: pathLayout.preset || basePreset.id || "standard",
      romsPattern: pathLayout.romsPattern || basePreset.romsPattern,
      savesPattern: pathLayout.savesPattern || basePreset.savesPattern,
      statesPattern: pathLayout.statesPattern || basePreset.statesPattern,
      coversPattern: pathLayout.coversPattern || basePreset.coversPattern,
      manualsPattern: pathLayout.manualsPattern || basePreset.manualsPattern,
      consoleOverrides: pathLayout.consoleOverrides || {},
    };
  }
  writeConfig(config);

  const dbPath = getDatabasePath();
  if (dbPath && !fs.existsSync(dbPath)) {
    try {
      fs.mkdirSync(dbPath, { recursive: true });
    } catch {
      // Ignore if directory cannot be created immediately
    }
  }

  return getAppConfig();
}

export function normalizeEmulatorEntry(entry) {
  if (!entry) return null;
  if (typeof entry === "string") {
    return { path: entry, args: "", workingDir: "" };
  }
  if (typeof entry === "object" && entry.path) {
    return {
      path: entry.path,
      args: typeof entry.args === "string" ? entry.args : "",
      workingDir: typeof entry.workingDir === "string" ? entry.workingDir : "",
    };
  }
  return null;
}

export function getEmulators() {
  const raw = readConfig().emulators || {};
  const normalized = {};
  for (const [consoleId, entry] of Object.entries(raw)) {
    const norm = normalizeEmulatorEntry(entry);
    if (norm) normalized[consoleId] = norm;
  }
  return normalized;
}

export function getEmulatorForConsole(consoleId) {
  return getEmulators()[consoleId] || null;
}

export function setEmulator(consoleId, emulatorPathOrConfig, args = "") {
  const config = readConfig();
  if (!config.emulators) config.emulators = {};

  if (typeof emulatorPathOrConfig === "object" && emulatorPathOrConfig !== null) {
    config.emulators[consoleId] = {
      path: emulatorPathOrConfig.path || "",
      args: emulatorPathOrConfig.args || "",
      workingDir: emulatorPathOrConfig.workingDir || "",
    };
  } else {
    config.emulators[consoleId] = {
      path: emulatorPathOrConfig,
      args: typeof args === "string" ? args : "",
      workingDir: "",
    };
  }

  writeConfig(config);
  return config.emulators[consoleId];
}

export function removeEmulator(consoleId) {
  const config = readConfig();
  if (config.emulators) {
    delete config.emulators[consoleId];
    writeConfig(config);
  }
}

export function getScraperConfig() {
  return (
    readConfig().scraper || {
      defaultScraper: "screenscraper",
      credentials: {
        screenscraper: {
          developerId: "",
          developerPassword: "",
          userId: "",
          userPassword: "",
        },
        thegamesdb: { apiKey: "" },
      },
    }
  );
}

export function setScraperConfig(scraperConfig) {
  const config = readConfig();
  config.scraper = scraperConfig;
  writeConfig(config);
}

export function getRommConfig() {
  const defaults = getDefaultRommConfig();
  const stored = readConfig().romm || {};
  return {
    ...defaults,
    ...stored,
    platformMap: { ...(stored.platformMap || {}) },
  };
}

export function setRommConfig(rommConfig = {}) {
  const config = readConfig();
  const current = getRommConfig();
  config.romm = {
    ...current,
    ...rommConfig,
    platformMap:
      rommConfig.platformMap !== undefined
        ? rommConfig.platformMap
        : current.platformMap,
  };
  writeConfig(config);
  return getRommConfig();
}

export function getAdbConfig() {
  const config = readConfig();
  return {
    adbPath: config.adbPath || "",
    defaultRemotePath: config.adbDefaultRemotePath || "/sdcard/ROMs",
    lastDeviceSerial: config.adbLastDeviceSerial || "",
    lastWirelessIp: config.adbLastWirelessIp || "",
  };
}

export function setAdbConfig({
  adbPath,
  defaultRemotePath,
  lastDeviceSerial,
  lastWirelessIp,
} = {}) {
  const config = readConfig();
  if (adbPath !== undefined) config.adbPath = adbPath;
  if (defaultRemotePath !== undefined)
    config.adbDefaultRemotePath = defaultRemotePath;
  if (lastDeviceSerial !== undefined)
    config.adbLastDeviceSerial = lastDeviceSerial;
  if (lastWirelessIp !== undefined) config.adbLastWirelessIp = lastWirelessIp;
  writeConfig(config);
  return getAdbConfig();
}
