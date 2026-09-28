import fs from "fs";
import path from "path";
import xml2js from "xml2js";
import {
  getRomsBasePath,
  getSyncEmulationStation,
  getDatabasePath,
} from "./configService.js";
import logger from "./utils/logger.js";

/**
 * Formats date into EmulationStation format: YYYYMMDDTHHMMSS
 */
export function formatEsReleaseDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  if (/^\d{8}T\d{6}$/.test(trimmed)) {
    return trimmed;
  }

  const clean = trimmed.replace(/[^\d]/g, "");
  if (clean.length >= 8) {
    return `${clean.slice(0, 8)}T000000`;
  }
  if (clean.length === 4) {
    return `${clean}0101T000000`;
  }
  return null;
}

/**
 * Returns the path to gamelist.xml for a console system
 */
export function getGamelistPathForConsole(consoleId) {
  const basePath = getRomsBasePath();
  if (!basePath) return null;
  return path.join(basePath, "Roms", consoleId, "gamelist.xml");
}

/**
 * Parses an existing gamelist.xml file
 */
export async function parseGamelistXml(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = await xml2js.parseStringPromise(content);
    if (!parsed || !parsed.gameList || !parsed.gameList.game) {
      return [];
    }

    const games = Array.isArray(parsed.gameList.game)
      ? parsed.gameList.game
      : [parsed.gameList.game];

    return games.map((g) => ({
      path: g.path?.[0] || "",
      name: g.name?.[0] || "",
      desc: g.desc?.[0] || "",
      image: g.image?.[0] || "",
      developer: g.developer?.[0] || "",
      releaseDate: g.releasedate?.[0] || "",
    }));
  } catch (error) {
    logger.error(`Error parsing gamelist.xml at ${filePath}:`, error);
    return [];
  }
}

/**
 * Syncs the gamelist.xml for a specific console based on its JSON database
 */
export function syncSystemGamelist(consoleId) {
  if (!getSyncEmulationStation()) {
    return { success: true, skipped: true, reason: "sync_disabled" };
  }

  const basePath = getRomsBasePath();
  if (!basePath) {
    return { success: false, error: "No romsBasePath configured" };
  }

  const dbPath = getDatabasePath();
  const jsonFilePath = path.join(dbPath, `${consoleId}.json`);

  if (!fs.existsSync(jsonFilePath)) {
    return { success: true, count: 0, skipped: true, reason: "no_database_for_console" };
  }

  let romsData = {};
  try {
    const raw = fs.readFileSync(jsonFilePath, "utf-8");
    romsData = JSON.parse(raw);
  } catch (err) {
    logger.error(`Failed to read database for ${consoleId}:`, err);
    return { success: false, error: err.message };
  }

  const xmlPath = getGamelistPathForConsole(consoleId);
  const targetDir = path.dirname(xmlPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const romList = Object.values(romsData);
  const gameEntries = romList.map((rom) => {
    const game = {
      path: `./${rom.romName}`,
      name: rom.title || rom.romName.replace(/\.[^.]+$/, ""),
    };

    if (rom.description) game.desc = rom.description;
    if (rom.developer) game.developer = rom.developer;
    if (rom.releaseDate) {
      const formattedDate = formatEsReleaseDate(rom.releaseDate);
      if (formattedDate) game.releasedate = formattedDate;
    }

    if (rom.coverPath) {
      let relCover = path.relative(targetDir, rom.coverPath).replace(/\\/g, "/");
      if (!relCover.startsWith(".") && !relCover.startsWith("/")) {
        relCover = `./${relCover}`;
      }
      game.image = relCover;
    }

    return game;
  });

  const builder = new xml2js.Builder({
    rootName: "gameList",
    xmldec: { version: "1.0", encoding: "UTF-8" },
    renderOpts: { pretty: true, indent: "  ", newline: "\n" },
  });

  const xmlContent = builder.buildObject({ game: gameEntries });

  try {
    fs.writeFileSync(xmlPath, xmlContent, "utf-8");
    logger.info(`Updated gamelist.xml for ${consoleId} with ${gameEntries.length} games`);
    return { success: true, count: gameEntries.length, xmlPath };
  } catch (err) {
    logger.error(`Failed to write gamelist.xml for ${consoleId}:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * Synchronizes all console gamelist.xml files
 */
export function syncAllGamelists() {
  if (!getSyncEmulationStation()) {
    return { success: true, skipped: true, reason: "sync_disabled" };
  }

  const dbPath = getDatabasePath();
  if (!fs.existsSync(dbPath)) {
    return { success: true, syncedConsoles: 0, totalGames: 0 };
  }

  const files = fs.readdirSync(dbPath).filter((f) => f.endsWith(".json"));
  let totalGames = 0;
  const synced = [];

  for (const file of files) {
    const consoleId = path.basename(file, ".json");
    const result = syncSystemGamelist(consoleId);
    if (result.success && !result.skipped) {
      synced.push(consoleId);
      totalGames += result.count || 0;
    }
  }

  return {
    success: true,
    syncedConsoles: synced.length,
    consoles: synced,
    totalGames,
  };
}
