import fs from "fs";
import path from "path";
import os from "os";
import { execFile, spawn, execSync } from "child_process";
import axios from "axios";
import AdmZip from "adm-zip";
import { getConfigDirectory, getAdbConfig, setAdbConfig } from "./configService.js";
import { getRomPathPC, getSavePathPC, getCoverPathPC } from "./utils/getPaths.js";
import { getAllRoms } from "./uiDataService.js";
import { createRomTemplate, persistRomToJson } from "./utils/getJsonUtils.js";
import { identifyRomSystem } from "./utils/getFilters.js";
import logger from "./utils/logger.js";

// Folder mappings between RomsManager console IDs and standard Android emulator folders
export const ANDROID_SYSTEM_FOLDERS = {
  nes: ["nes", "fc", "NES", "FC"],
  sfc: ["snes", "sfc", "SNES", "SFC"],
  gb: ["gb", "GB"],
  gbc: ["gbc", "GBC"],
  gba: ["gba", "GBA"],
  n64: ["n64", "N64"],
  nds: ["nds", "NDS"],
  genesis: ["genesis", "megadrive", "md", "GENESIS", "MEGADRIVE"],
  sega_cd: ["segacd", "sega_cd", "SEGACD"],
  ps: ["psx", "ps1", "ps", "PSX", "PS1", "PS"],
  ps2: ["ps2", "PS2"],
  psp: ["psp", "PSP"],
  gc: ["gc", "gamecube", "GC", "GAMECUBE"],
  "3ds": ["3ds", "3DS"],
  neogeo: ["neogeo", "NEOGEO"],
  switch: ["switch", "SWITCH"],
};

export const CONSOLE_DISPLAY_NAMES = {
  nes: "Nintendo (NES)",
  sfc: "Super Nintendo (SNES)",
  gb: "Game Boy",
  gbc: "Game Boy Color",
  gba: "Game Boy Advance",
  n64: "Nintendo 64",
  nds: "Nintendo DS",
  genesis: "Sega Genesis / Mega Drive",
  sega_cd: "Sega CD",
  ps: "PlayStation 1 (PSX)",
  ps2: "PlayStation 2",
  psp: "PlayStation Portable",
  gc: "Nintendo GameCube",
  "3ds": "Nintendo 3DS",
  neogeo: "Neo Geo",
  switch: "Nintendo Switch",
};

/**
 * Returns the preferred folder name on Android for a given console ID
 */
export function getDefaultFolderForConsole(consoleId) {
  return ANDROID_SYSTEM_FOLDERS[consoleId]?.[0] || consoleId;
}

/**
 * Maps an Android folder name back to the internal console ID
 */
export function mapFolderToConsoleId(folderName) {
  if (!folderName) return null;
  const clean = folderName.trim().toLowerCase();
  for (const [consoleId, aliases] of Object.entries(ANDROID_SYSTEM_FOLDERS)) {
    if (consoleId.toLowerCase() === clean) return consoleId;
    for (const alias of aliases) {
      if (alias.toLowerCase() === clean) return consoleId;
    }
  }
  return null;
}

/**
 * Locates the ADB binary on the host system
 */
export function resolveAdbBinary() {
  const config = getAdbConfig();
  if (config.adbPath && fs.existsSync(config.adbPath)) {
    return config.adbPath;
  }

  // Check in the local app-managed platform-tools directory
  const localAdb = path.join(
    getConfigDirectory(),
    "platform-tools",
    process.platform === "win32" ? "adb.exe" : "adb",
  );
  if (fs.existsSync(localAdb)) {
    return localAdb;
  }

  // Check common operating system paths
  const commonPaths = [];
  if (process.platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA || "";
    commonPaths.push(
      path.join(localAppData, "Android", "Sdk", "platform-tools", "adb.exe"),
      "C:\\platform-tools\\adb.exe",
      "C:\\adb\\adb.exe",
    );
  } else if (process.platform === "darwin") {
    commonPaths.push(
      "/opt/homebrew/bin/adb",
      "/usr/local/bin/adb",
      path.join(os.homedir(), "Library", "Android", "sdk", "platform-tools", "adb"),
    );
  } else {
    // Linux
    commonPaths.push(
      "/usr/bin/adb",
      "/usr/local/bin/adb",
      path.join(os.homedir(), "Android", "Sdk", "platform-tools", "adb"),
      path.join(os.homedir(), ".android-sdk", "platform-tools", "adb"),
      path.join(os.homedir(), ".local", "share", "android-sdk", "platform-tools", "adb"),
    );
  }

  for (const testPath of commonPaths) {
    if (fs.existsSync(testPath)) {
      return testPath;
    }
  }

  // Check PATH environment variable
  try {
    const cmd = process.platform === "win32" ? "where adb" : "which adb";
    const found = execSync(cmd, { stdio: ["pipe", "pipe", "ignore"], encoding: "utf-8" }).trim();
    const firstLine = found.split(/\r?\n/)[0];
    if (firstLine && fs.existsSync(firstLine)) {
      return firstLine;
    }
  } catch {
    // Not found in PATH
  }

  return null;
}

/**
 * Executes an ADB command with arguments
 */
export function execAdb(args, options = {}) {
  const adbBin = resolveAdbBinary();
  if (!adbBin) {
    return Promise.reject(new Error("ADB no encontrado en el sistema"));
  }

  return new Promise((resolve, reject) => {
    execFile(
      adbBin,
      args,
      { maxBuffer: 20 * 1024 * 1024, timeout: options.timeout || 30000, ...options },
      (error, stdout, stderr) => {
        if (error) {
          error.stderr = stderr;
          return reject(error);
        }
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      },
    );
  });
}

/**
 * Checks ADB installation and version
 */
export async function getAdbStatus() {
  const binaryPath = resolveAdbBinary();
  if (!binaryPath) {
    return {
      installed: false,
      path: null,
      version: null,
    };
  }

  try {
    const { stdout } = await execAdb(["version"]);
    const versionMatch = stdout.match(/Android Debug Bridge version ([\d.]+)/);
    const version = versionMatch ? versionMatch[1] : "Detectado";
    return {
      installed: true,
      path: binaryPath,
      version,
    };
  } catch (error) {
    return {
      installed: false,
      path: binaryPath,
      version: null,
      error: error.message,
    };
  }
}

/**
 * Automatically downloads and installs Google's official platform-tools
 */
export async function downloadPlatformTools(onProgress) {
  let downloadUrl = "";
  if (process.platform === "win32") {
    downloadUrl = "https://dl.google.com/android/repository/platform-tools-latest-windows.zip";
  } else if (process.platform === "darwin") {
    downloadUrl = "https://dl.google.com/android/repository/platform-tools-latest-darwin.zip";
  } else {
    downloadUrl = "https://dl.google.com/android/repository/platform-tools-latest-linux.zip";
  }

  const targetDir = path.join(getConfigDirectory(), "platform-tools");
  const tempZipPath = path.join(getConfigDirectory(), "platform-tools-temp.zip");
  fs.mkdirSync(getConfigDirectory(), { recursive: true });

  if (onProgress) onProgress({ status: "downloading", percent: 0 });

  const response = await axios({
    method: "get",
    url: downloadUrl,
    responseType: "arraybuffer",
    onDownloadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        onProgress({ status: "downloading", percent });
      }
    },
  });

  fs.writeFileSync(tempZipPath, Buffer.from(response.data));

  if (onProgress) onProgress({ status: "extracting", percent: 90 });

  const zip = new AdmZip(tempZipPath);
  // Zip contains a 'platform-tools' folder inside
  zip.extractAllTo(getConfigDirectory(), true);

  try {
    fs.unlinkSync(tempZipPath);
  } catch {}

  const adbBinary = path.join(targetDir, process.platform === "win32" ? "adb.exe" : "adb");
  if (process.platform !== "win32" && fs.existsSync(adbBinary)) {
    try {
      fs.chmodSync(adbBinary, 0o755);
    } catch {}
  }

  setAdbConfig({ adbPath: adbBinary });

  if (onProgress) onProgress({ status: "completed", percent: 100 });

  return getAdbStatus();
}

/**
 * Parses raw output from 'adb devices -l'
 */
export function parseAdbDevicesOutput(output) {
  const lines = output.split(/\r?\n/);
  const devices = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("List of devices") || line.startsWith("* daemon")) {
      continue;
    }

    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;

    const serial = parts[0];
    const state = parts[1]; // 'device', 'unauthorized', 'offline', 'authorizing'

    const details = {};
    for (let i = 2; i < parts.length; i++) {
      const col = parts[i];
      const sepIdx = col.indexOf(":");
      if (sepIdx !== -1) {
        const key = col.substring(0, sepIdx);
        const val = col.substring(sepIdx + 1);
        details[key] = val;
      }
    }

    const isWireless = serial.includes(":") || /^\d+\.\d+\.\d+\.\d+/.test(serial);
    const rawModel = details.model ? details.model.replace(/_/g, " ") : "";
    const rawProduct = details.product ? details.product.replace(/_/g, " ") : "";
    const fallbackName = isWireless ? "Android (WiFi)" : "Consola Android (USB)";

    devices.push({
      serial,
      state,
      model: rawModel || fallbackName,
      product: rawProduct,
      device: details.device || "",
      transportId: details.transport_id || "",
      isWireless,
      displayName: `${rawModel || fallbackName}${isWireless ? " [WiFi]" : " [USB]"}`,
    });
  }

  return devices;
}

/**
 * Lists connected devices with enhanced hardware metadata
 */
export async function listDevices() {
  const status = await getAdbStatus();
  if (!status.installed) {
    return [];
  }

  try {
    const { stdout } = await execAdb(["devices", "-l"]);
    const devices = parseAdbDevicesOutput(stdout);

    // For connected USB/Wireless devices, fetch friendly console model info
    for (const device of devices) {
      if (device.state === "device") {
        try {
          const [modelRes, mfgRes, androidVerRes] = await Promise.all([
            execAdb(["-s", device.serial, "shell", "getprop", "ro.product.model"]),
            execAdb(["-s", device.serial, "shell", "getprop", "ro.product.manufacturer"]),
            execAdb(["-s", device.serial, "shell", "getprop", "ro.build.version.release"]),
          ]);

          const model = modelRes.stdout.trim();
          const manufacturer = mfgRes.stdout.trim();
          const androidVer = androidVerRes.stdout.trim();

          if (model) device.model = model;
          if (manufacturer) device.manufacturer = manufacturer;
          if (androidVer) device.androidVersion = androidVer;

          const brandStr = manufacturer ? `${manufacturer} ` : "";
          const typeStr = device.isWireless ? "WiFi" : "USB";
          device.displayName = `${brandStr}${model || device.model} (${typeStr})`;
        } catch {
          // Keep defaults if shell properties fail
        }
      }
    }

    return devices;
  } catch (error) {
    logger.error("Error listing ADB devices:", error);
    return [];
  }
}

/**
 * Connect to device over Wi-Fi
 */
export async function connectWireless(ip, port = 5555) {
  if (!ip) throw new Error("Debe proporcionar una dirección IP");
  const target = port ? `${ip}:${port}` : ip;
  try {
    const { stdout } = await execAdb(["connect", target]);
    const success = stdout.toLowerCase().includes("connected to");
    return { success, message: stdout };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Disconnect from device
 */
export async function disconnectWireless(target) {
  try {
    const { stdout } = await execAdb(["disconnect", target]);
    return { success: true, message: stdout };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Discovers storage locations on the Android console (Internal Storage & MicroSD cards)
 */
export async function getStorageLocations(serial) {
  const locations = [];

  // Default internal storage
  locations.push({
    id: "internal",
    label: "Memoria interna (/sdcard/ROMs)",
    path: "/sdcard/ROMs",
    isExternal: false,
    isDefault: true,
  });

  try {
    // Check if /sdcard/Roms exists with uppercase/lowercase
    const checkInternal = await execAdb([
      "-s",
      serial,
      "shell",
      "sh -c 'if [ -d /sdcard/Roms ]; then echo \"Roms\"; elif [ -d /sdcard/ROMs ]; then echo \"ROMs\"; else echo \"NONE\"; fi'",
    ]);
    const internalDir = checkInternal.stdout.trim();
    if (internalDir === "Roms") {
      locations[0].path = "/sdcard/Roms";
      locations[0].label = "Memoria interna (/sdcard/Roms)";
    }

    // Detect external MicroSD cards mounted under /storage
    const { stdout } = await execAdb([
      "-s",
      serial,
      "shell",
      "ls -d /storage/* 2>/dev/null",
    ]);

    const lines = stdout.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    for (const item of lines) {
      const base = path.posix.basename(item);
      // Skip emulated and self directories
      if (base === "emulated" || base === "self" || base === "knox-emulated") {
        continue;
      }

      // Check if folder contains ROMs or Roms
      const checkSd = await execAdb([
        "-s",
        serial,
        "shell",
        `sh -c 'if [ -d "${item}/ROMs" ]; then echo "ROMs"; elif [ -d "${item}/Roms" ]; then echo "Roms"; else echo "DEFAULT"; fi'`,
      ]);
      const sdSub = checkSd.stdout.trim();
      const romsSubfolder = sdSub === "Roms" ? "Roms" : "ROMs";
      const fullPath = `${item}/${romsSubfolder}`;

      locations.push({
        id: `sd_${base}`,
        label: `Tarjeta MicroSD (${fullPath})`,
        path: fullPath,
        isExternal: true,
        isDefault: false,
      });
    }
  } catch (error) {
    logger.warn("Could not scan full storage mounts on device:", error.message);
  }

  return locations;
}

/**
 * Scans ROMs already present on the Android console
 */
export async function scanRemoteRoms(serial, remoteRomsPath) {
  if (!serial || !remoteRomsPath) return [];

  const foundRoms = [];

  try {
    // 1. Check existing system subdirectories on the Android console
    const { stdout: dirListOutput } = await execAdb([
      "-s",
      serial,
      "shell",
      `ls -1 "${remoteRomsPath}" 2>/dev/null`,
    ]);

    const remoteDirs = dirListOutput
      .split(/\r?\n/)
      .map((d) => d.trim().replace(/\/$/, ""))
      .filter(Boolean);

    for (const remoteDir of remoteDirs) {
      const consoleId = mapFolderToConsoleId(remoteDir);
      if (!consoleId) continue;

      const consoleName = CONSOLE_DISPLAY_NAMES[consoleId] || consoleId.toUpperCase();
      const systemPath = `${remoteRomsPath}/${remoteDir}`;

      // List files inside system directory
      const { stdout: filesOutput } = await execAdb([
        "-s",
        serial,
        "shell",
        `ls -1 "${systemPath}" 2>/dev/null`,
      ]);

      const files = filesOutput.split(/\r?\n/).map((f) => f.trim()).filter(Boolean);

      for (const fileName of files) {
        // Skip hidden files, system files, gamelist.xml, media folders
        if (
          fileName.startsWith(".") ||
          fileName.toLowerCase() === "gamelist.xml" ||
          fileName.toLowerCase() === "media" ||
          fileName.toLowerCase() === "images" ||
          fileName.toLowerCase() === "covers"
        ) {
          continue;
        }

        foundRoms.push({
          consoleId,
          consoleName,
          romName: fileName,
          systemFolder: remoteDir,
          remotePath: `${systemPath}/${fileName}`,
        });
      }
    }
  } catch (error) {
    logger.error("Error scanning remote ROMs on Android console:", error);
  }

  return foundRoms;
}

/**
 * Compares PC library with Android console ROMs to determine sync differences
 */
export async function compareRoms(serial, remoteRomsPath) {
  const allPcRoms = getAllRoms(); // returns { consoleId: [romObject, ...] }
  const remoteRoms = await scanRemoteRoms(serial, remoteRomsPath);

  // Index remote ROMs: key = `${consoleId}:${romName.toLowerCase()}`
  const remoteMap = new Map();
  for (const rom of remoteRoms) {
    remoteMap.set(`${rom.consoleId}:${rom.romName.toLowerCase()}`, rom);
  }

  const toExport = [];
  const synced = [];
  const pcConsoles = [];

  for (const [consoleId, roms] of Object.entries(allPcRoms)) {
    const consoleName = CONSOLE_DISPLAY_NAMES[consoleId] || consoleId.toUpperCase();
    const consoleData = {
      consoleId,
      consoleName,
      romCount: roms.length,
      roms: [],
    };

    for (const pcRom of roms) {
      const key = `${consoleId}:${pcRom.romName.toLowerCase()}`;
      const existsOnRemote = remoteMap.has(key);

      const item = {
        consoleId,
        consoleName,
        romName: pcRom.romName,
        title: pcRom.title || pcRom.romName,
        localPath: pcRom.romPath,
        savePath: pcRom.savePath || null,
        coverPath: pcRom.coverPath || null,
        existsOnRemote,
      };

      consoleData.roms.push(item);

      if (!existsOnRemote) {
        toExport.push(item);
      } else {
        synced.push(item);
      }
    }

    if (consoleData.roms.length > 0) {
      pcConsoles.push(consoleData);
    }
  }

  // Index PC ROMs: key = `${consoleId}:${romName.toLowerCase()}`
  const pcMap = new Map();
  for (const [consoleId, roms] of Object.entries(allPcRoms)) {
    for (const r of roms) {
      pcMap.set(`${consoleId}:${r.romName.toLowerCase()}`, true);
    }
  }

  const toImport = [];
  for (const remoteRom of remoteRoms) {
    const key = `${remoteRom.consoleId}:${remoteRom.romName.toLowerCase()}`;
    if (!pcMap.has(key)) {
      toImport.push(remoteRom);
    }
  }

  return {
    toExport,
    toImport,
    synced,
    remoteRoms,
    pcConsoles,
  };
}

/**
 * Pushes selected ROMs from PC to the Android console via USB cable
 */
export async function exportRomsToAndroid(
  serial,
  remoteRomsPath,
  items,
  options = { syncSaves: false, syncCovers: false },
  onProgress = null,
) {
  if (!items || items.length === 0) {
    return { success: true, count: 0, errors: [] };
  }

  const errors = [];
  let successfulCount = 0;
  const total = items.length;

  for (let i = 0; i < total; i++) {
    const item = items[i];
    const systemFolder = getDefaultFolderForConsole(item.consoleId);
    const targetDir = `${remoteRomsPath}/${systemFolder}`;
    const targetRemotePath = `${targetDir}/${item.romName}`;

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        romName: item.romName,
        consoleId: item.consoleId,
        percent: Math.round(((i) / total) * 100),
        status: "transferring",
      });
    }

    try {
      // 1. Ensure target directory exists on Android device
      await execAdb(["-s", serial, "shell", `mkdir -p "${targetDir}"`]);

      // 2. Push ROM file via ADB
      await execAdb(["-s", serial, "push", item.localPath, targetRemotePath], {
        timeout: 300000, // 5 minutes per file
      });

      // 3. Optionally sync save file if present
      if (options.syncSaves && item.savePath && fs.existsSync(item.savePath)) {
        const saveFileName = path.basename(item.savePath);
        const targetSavePath = `${targetDir}/${saveFileName}`;
        try {
          await execAdb(["-s", serial, "push", item.savePath, targetSavePath]);
        } catch (saveErr) {
          logger.warn(`Could not sync save file for ${item.romName}:`, saveErr.message);
        }
      }

      // 4. Optionally sync cover image if present
      if (options.syncCovers && item.coverPath && fs.existsSync(item.coverPath)) {
        const mediaDir = `${targetDir}/media`;
        const coverFileName = path.basename(item.coverPath);
        try {
          await execAdb(["-s", serial, "shell", `mkdir -p "${mediaDir}"`]);
          await execAdb(["-s", serial, "push", item.coverPath, `${mediaDir}/${coverFileName}`]);
        } catch (coverErr) {
          logger.warn(`Could not sync cover for ${item.romName}:`, coverErr.message);
        }
      }

      successfulCount++;

      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          romName: item.romName,
          consoleId: item.consoleId,
          percent: Math.round(((i + 1) / total) * 100),
          status: "completed",
        });
      }
    } catch (err) {
      logger.error(`Failed to export ROM ${item.romName}:`, err);
      errors.push({ romName: item.romName, error: err.message });

      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          romName: item.romName,
          consoleId: item.consoleId,
          percent: Math.round(((i + 1) / total) * 100),
          status: "error",
          error: err.message,
        });
      }
    }
  }

  return {
    success: errors.length === 0,
    count: successfulCount,
    errors,
  };
}

/**
 * Pulls selected ROMs from the Android console to PC via USB cable
 */
export async function importRomsFromAndroid(
  serial,
  items,
  onProgress = null,
) {
  if (!items || items.length === 0) {
    return { success: true, count: 0, errors: [] };
  }

  const errors = [];
  let successfulCount = 0;
  const total = items.length;

  for (let i = 0; i < total; i++) {
    const item = items[i];
    const destinationPath = getRomPathPC(item.consoleId, item.romName);
    const destDir = path.dirname(destinationPath);

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        romName: item.romName,
        consoleId: item.consoleId,
        percent: Math.round(((i) / total) * 100),
        status: "transferring",
      });
    }

    try {
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Pull file from Android device via ADB
      await execAdb(["-s", serial, "pull", item.remotePath, destinationPath], {
        timeout: 300000,
      });

      // Register imported ROM into PC database
      const romData = createRomTemplate(destinationPath, item.consoleId);
      if (romData) {
        persistRomToJson(romData);
      }

      successfulCount++;

      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          romName: item.romName,
          consoleId: item.consoleId,
          percent: Math.round(((i + 1) / total) * 100),
          status: "completed",
        });
      }
    } catch (err) {
      logger.error(`Failed to import ROM ${item.romName}:`, err);
      errors.push({ romName: item.romName, error: err.message });

      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          romName: item.romName,
          consoleId: item.consoleId,
          percent: Math.round(((i + 1) / total) * 100),
          status: "error",
          error: err.message,
        });
      }
    }
  }

  return {
    success: errors.length === 0,
    count: successfulCount,
    errors,
  };
}

/**
 * Quick export of a single ROM to the connected Android console
 */
export async function exportSingleRomToAndroid(
  serial,
  remoteRomsPath,
  rom,
  options = { syncSaves: true, syncCovers: true },
) {
  const item = {
    consoleId: rom.system,
    romName: rom.romName,
    localPath: rom.romPath,
    savePath: rom.savePath || null,
    coverPath: rom.coverPath || null,
  };

  return exportRomsToAndroid(serial, remoteRomsPath, [item], options);
}
