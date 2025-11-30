import fs from "fs";
import path from "path";
import { app } from "electron";
import { v4 as uuidv4 } from "uuid";
import pathsConfig from "../data/paths.json";

const platform =
  process.platform === "win32"
    ? "windows"
    : process.platform === "darwin"
      ? "mac"
      : "linux";
const config = pathsConfig[platform];

function expandPath(pathStr) {
  if (pathStr.startsWith("~")) {
    return path.join(require("os").homedir(), pathStr.slice(1));
  }
  if (process.platform === "win32") {
    return pathStr.replace(/%([^%]+)%/g, (_, key) => process.env[key] || "");
  }
  return pathStr;
}

const BASE_PATH = expandPath(config.app_data);

export const PATHS = {
  base: BASE_PATH,
  database: path.join(BASE_PATH, config.database),
  covers: {
    original: path.join(BASE_PATH, config.covers.original),
    custom: path.join(BASE_PATH, config.covers.custom),
  },
  roms: path.join(BASE_PATH, config.roms),
  saves: path.join(BASE_PATH, config.saves),
  backups: path.join(BASE_PATH, config.backups),
};

export function initStorage() {
  const dirsToCreate = [
    PATHS.base,
    PATHS.database,
    PATHS.covers.original,
    PATHS.covers.custom,
    PATHS.roms,
    PATHS.saves,
    PATHS.backups,
  ];

  dirsToCreate.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const indexPath = path.join(PATHS.database, "index.json");
  if (!fs.existsSync(indexPath)) {
    const indexData = {
      roms: [],
      collections: [],
      last_updated: new Date().toISOString(),
    };
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
  }

  console.log("Storage initialized at:", PATHS.base);
}

function getIndexPath() {
  return path.join(PATHS.database, "index.json");
}

function readIndex() {
  const indexPath = getIndexPath();
  if (!fs.existsSync(indexPath)) {
    return {
      roms: [],
      collections: [],
      last_updated: new Date().toISOString(),
    };
  }
  return JSON.parse(fs.readFileSync(indexPath, "utf-8"));
}

function writeIndex(data) {
  const indexPath = getIndexPath();
  data.last_updated = new Date().toISOString();
  fs.writeFileSync(indexPath, JSON.stringify(data, null, 2));
}

function saveCoverImage(sourcePath, id) {
  if (!sourcePath) return null;
  try {
    const ext = path.extname(sourcePath);
    const fileName = `${id}${ext}`;
    const destPath = path.join(PATHS.covers.original, fileName);
    fs.copyFileSync(sourcePath, destPath);
    return destPath;
  } catch (error) {
    console.error("Error saving cover image:", error);
    return null;
  }
}

export function createRom(romData) {
  const id = uuidv4();

  let coverPath = null;
  if (romData.cover_path) {
    coverPath = saveCoverImage(romData.cover_path, id);
  }

  const rom = {
    id,
    file_path: romData.file_path || "",
    file_name: romData.file_name || "",
    file_size: romData.file_size || 0,
    console: romData.console || "",
    cover_path: coverPath,
    custom_cover_path: null,
    date_added: new Date().toISOString(),
    date_modified: new Date().toISOString(),
    last_played: null,
    play_time: 0,
    favorite: false,
    metadata: {
      title: romData.title || romData.file_name || "",
      year: romData.year || null,
      developer: null,
      publisher: null,
      genre: romData.genre || null,
      description: null,
      num_players: null,
      region: null,
      language: null,
      rating: null,
    },
    collections: [],
    save_states: [],
  };

  const romPath = path.join(PATHS.database, `rom_${id}.json`);
  fs.writeFileSync(romPath, JSON.stringify(rom, null, 2));

  const index = readIndex();
  index.roms.push(id);
  writeIndex(index);

  return rom;
}

export function getRom(id) {
  const romPath = path.join(PATHS.database, `rom_${id}.json`);
  if (!fs.existsSync(romPath)) return null;
  return JSON.parse(fs.readFileSync(romPath, "utf-8"));
}

export function getAllRoms() {
  const index = readIndex();
  return index.roms.map((id) => getRom(id)).filter((rom) => rom !== null);
}

export function updateRom(id, updates) {
  const rom = getRom(id);
  if (!rom) return null;

  // Handle cover update if present
  if (updates.cover_path && updates.cover_path !== rom.cover_path) {
    updates.cover_path = saveCoverImage(updates.cover_path, id);
  }

  const updatedRom = {
    ...rom,
    ...updates,
    metadata: {
      ...rom.metadata,
      ...(updates.metadata || {}),
    },
    date_modified: new Date().toISOString(),
  };
  const romPath = path.join(PATHS.database, `rom_${id}.json`);
  fs.writeFileSync(romPath, JSON.stringify(updatedRom, null, 2));

  return updatedRom;
}

export function deleteRom(id) {
  const romPath = path.join(PATHS.database, `rom_${id}.json`);
  if (!fs.existsSync(romPath)) return false;

  fs.unlinkSync(romPath);

  const index = readIndex();
  index.roms = index.roms.filter((romId) => romId !== id);
  writeIndex(index);

  return true;
}
