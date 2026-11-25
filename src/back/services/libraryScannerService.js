import fs from "fs";
import path from "path";
import consolesData from "../data/consoles.json" with { type: "json" };
import { getRomsBasePath, getPathLayout } from "./configService.js";
import {
  getRomsDirPC,
  getSavesDirPC,
  getCoversDirPC,
  getManualsDirPC,
  getPathSystemJsonSystemsPC,
} from "./utils/getPaths.js";
import {
  isValidExtensionForConsole,
  resolveConsoleIdFromAlias,
} from "./utils/getFilters.js";
import { createRomTemplate, persistRomToJson } from "./utils/getJsonUtils.js";
import logger from "./utils/logger.js";

const COVER_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"];

function findMatchingAsset(dir, baseName, extensions) {
  if (!dir || !fs.existsSync(dir)) return null;
  for (const ext of extensions) {
    const candidate = path.join(dir, `${baseName}${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function getConsoleSaveFormats(consoleId) {
  const entry = Object.values(consolesData.consoles).find(
    (c) => c.id_name === consoleId,
  );
  return entry?.save_formats || [".sav", ".srm"];
}

/**
 * Discovers candidate (consoleId, romsDir) pairs for the user's configured
 * base path, layout pattern, console overrides, and alias folder names.
 */
function discoverConsoleDirectories() {
  const basePath = getRomsBasePath();
  if (!basePath || !fs.existsSync(basePath)) return [];

  const layout = getPathLayout();
  const seen = new Map(); // consoleId -> Set<dirPath>

  const registerDir = (consoleId, dirPath) => {
    if (!dirPath || !fs.existsSync(dirPath)) return;
    try {
      if (!fs.statSync(dirPath).isDirectory()) return;
    } catch {
      return;
    }
    const normalized = path.normalize(dirPath);
    if (!seen.has(consoleId)) seen.set(consoleId, new Set());
    seen.get(consoleId).add(normalized);
  };

  // 1. Check canonical configured directory for every known console
  for (const consoleEntry of Object.values(consolesData.consoles)) {
    const consoleId = consoleEntry.id_name;
    registerDir(consoleId, getRomsDirPC(consoleId));

    // Also check aliases under the user's configured romsPattern (e.g. "snes", "psx", "ngc")
    const aliases = consoleEntry.aliases || [];
    for (const alias of aliases) {
      if (alias === consoleId) continue;
      const aliasDir = path.normalize(
        layout.romsPattern
          .replace(/\{base\}/g, basePath)
          .replace(/\{console\}/g, alias),
      );
      registerDir(consoleId, aliasDir);
    }
  }

  // 2. Check any custom console overrides
  for (const [consoleId] of Object.entries(layout.consoleOverrides || {})) {
    registerDir(consoleId, getRomsDirPC(consoleId));
  }

  // 3. Probe parent directory of {console} in romsPattern for unknown alias casing
  const patternParts = layout.romsPattern.split("{console}");
  if (patternParts.length === 2) {
    const parentPattern = patternParts[0].replace(/\{base\}/g, basePath);
    const suffixPattern = patternParts[1].replace(/^[/\\]+/, "");
    const parentDir = path.normalize(parentPattern);
    if (fs.existsSync(parentDir)) {
      try {
        const entries = fs.readdirSync(parentDir, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isDirectory()) continue;
          const resolvedId = resolveConsoleIdFromAlias(entry.name);
          if (!resolvedId) continue;
          const candidateDir = suffixPattern
            ? path.join(parentDir, entry.name, suffixPattern)
            : path.join(parentDir, entry.name);
          registerDir(resolvedId, candidateDir);
        }
      } catch {
        // Ignore unreadable directories
      }
    }
  }

  const result = [];
  for (const [consoleId, dirs] of seen.entries()) {
    for (const dir of dirs) {
      result.push({ consoleId, dir });
    }
  }
  return result;
}

/**
 * Scans the user's configured library folders and registers any ROM files
 * found on disk without moving or copying them.
 */
export function scanLocalLibrary({ pruneMissing = false } = {}) {
  const basePath = getRomsBasePath();
  if (!basePath || !fs.existsSync(basePath)) {
    return {
      success: false,
      error: "La carpeta base de ROMs no está configurada o no existe.",
      added: 0,
      updated: 0,
      removed: 0,
      consolesScanned: 0,
    };
  }

  const dbDir = getPathSystemJsonSystemsPC();
  const discovered = discoverConsoleDirectories();
  const consoleDirsMap = new Map();
  for (const { consoleId, dir } of discovered) {
    if (!consoleDirsMap.has(consoleId)) consoleDirsMap.set(consoleId, []);
    consoleDirsMap.get(consoleId).push(dir);
  }

  let added = 0;
  let updated = 0;
  let removed = 0;

  for (const [consoleId, dirs] of consoleDirsMap.entries()) {
    const jsonPath = path.join(dbDir, `${consoleId}.json`);
    let existingDb = {};
    if (fs.existsSync(jsonPath)) {
      try {
        existingDb = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      } catch {
        existingDb = {};
      }
    }

    const coversDir = getCoversDirPC(consoleId);
    const savesDir = getSavesDirPC(consoleId);
    const manualsDir = getManualsDirPC(consoleId);
    const saveExts = getConsoleSaveFormats(consoleId);

    const foundOnDisk = new Set();

    for (const dir of dirs) {
      let files = [];
      try {
        files = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        continue;
      }

      for (const dirent of files) {
        if (!dirent.isFile()) continue;
        const fileName = dirent.name;
        if (fileName.startsWith(".") || fileName === "gamelist.xml") continue;
        if (!isValidExtensionForConsole(fileName, consoleId)) continue;

        foundOnDisk.add(fileName);
        const fullRomPath = path.join(dir, fileName);
        const baseName = path.parse(fileName).name;

        const existingEntry = existingDb[fileName];
        const detectedCover = findMatchingAsset(coversDir, baseName, COVER_EXTENSIONS);
        const detectedSave = findMatchingAsset(savesDir, baseName, saveExts);
        const detectedManual = findMatchingAsset(manualsDir, baseName, [".pdf"]);

        if (!existingEntry) {
          const romObj = {
            ...createRomTemplate(fullRomPath, consoleId),
            coverPath: detectedCover,
            savePath: detectedSave,
            manualPath: detectedManual,
          };
          persistRomToJson(romObj);
          existingDb[fileName] = romObj;
          added++;
        } else {
          let changed = false;
          const patch = { ...existingEntry };
          if (patch.romPath !== fullRomPath) {
            patch.romPath = fullRomPath;
            changed = true;
          }
          if (!patch.coverPath && detectedCover) {
            patch.coverPath = detectedCover;
            changed = true;
          }
          if (!patch.savePath && detectedSave) {
            patch.savePath = detectedSave;
            changed = true;
          }
          if (!patch.manualPath && detectedManual) {
            patch.manualPath = detectedManual;
            changed = true;
          }
          if (changed) {
            persistRomToJson(patch);
            updated++;
          }
        }
      }
    }

    if (pruneMissing && fs.existsSync(jsonPath)) {
      let currentDb = {};
      try {
        currentDb = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      } catch {
        currentDb = {};
      }
      let pruned = false;
      for (const [romName, rom] of Object.entries(currentDb)) {
        if (!foundOnDisk.has(romName) && (!rom.romPath || !fs.existsSync(rom.romPath))) {
          delete currentDb[romName];
          removed++;
          pruned = true;
        }
      }
      if (pruned) {
        fs.writeFileSync(jsonPath, JSON.stringify(currentDb, null, 2), "utf-8");
      }
    }
  }

  logger.info(
    `Library scan complete: ${added} added, ${updated} updated, ${removed} removed across ${consoleDirsMap.size} consoles`,
  );

  return {
    success: true,
    added,
    updated,
    removed,
    consolesScanned: consoleDirsMap.size,
  };
}
