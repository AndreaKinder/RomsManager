import fs from "fs";
import path from "path";
import os from "os";
import https from "https";
import axios from "axios";
import { getRommConfig } from "./configService.js";
import {
  getRomPathPC,
  getCoverPathPC,
  getSavePathPC,
} from "./utils/getPaths.js";
import { resolveConsoleIdFromAlias } from "./utils/getFilters.js";
import { persistRomToJson, updateRomInJson } from "./utils/getJsonUtils.js";
import { getAllRoms } from "./uiDataService.js";
import logger from "./utils/logger.js";

function normalizeServerUrl(url) {
  if (!url || typeof url !== "string") return "";
  return url.trim().replace(/\/+$/, "");
}

function createRommClient(overrideConfig = null) {
  const cfg = overrideConfig ? { ...getRommConfig(), ...overrideConfig } : getRommConfig();
  const baseURL = normalizeServerUrl(cfg.serverUrl);
  if (!baseURL) {
    throw new Error("URL del servidor RomM no configurada.");
  }

  const headers = {
    Accept: "application/json",
  };

  if (cfg.authType === "basic" && cfg.username) {
    const encoded = Buffer.from(`${cfg.username}:${cfg.password || ""}`).toString("base64");
    headers.Authorization = `Basic ${encoded}`;
  } else if (cfg.apiToken) {
    headers.Authorization = `Bearer ${cfg.apiToken.trim()}`;
  }

  const httpsAgent =
    cfg.tlsVerify === false
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined;

  return {
    cfg,
    baseURL,
    client: axios.create({
      baseURL,
      headers,
      httpsAgent,
      timeout: 30000,
    }),
  };
}

export function resolveLocalConsoleId(rommSlug, platformMap = {}) {
  if (!rommSlug) return null;
  const normalized = rommSlug.trim().toLowerCase();
  if (platformMap && platformMap[normalized]) {
    return platformMap[normalized];
  }
  if (platformMap && platformMap[rommSlug]) {
    return platformMap[rommSlug];
  }
  return resolveConsoleIdFromAlias(normalized) || normalized;
}

/**
 * Optional convenience helper: checks whether a local romm-sync config file
 * exists on the machine so the user can pre-fill URL and token in one click.
 */
export function detectRommSyncConfig() {
  const candidates =
    process.platform === "win32"
      ? [path.join(process.env.APPDATA || os.homedir(), "romm-sync", "config.json")]
      : [
          path.join(os.homedir(), ".local", "share", "romm-sync", "config.json"),
          path.join(os.homedir(), ".config", "romm-sync", "config.json"),
        ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        const raw = JSON.parse(fs.readFileSync(candidate, "utf-8"));
        return {
          found: true,
          sourcePath: candidate,
          serverUrl: normalizeServerUrl(raw.server_url || ""),
          apiToken: raw.token || "",
          username: raw.username || "",
          tlsVerify: raw.tls_verify !== false,
          authType: raw.token ? "token" : "basic",
        };
      } catch {
        // Ignore malformed external config
      }
    }
  }

  return { found: false };
}

export async function testRommConnection(overrideConfig = null) {
  try {
    const { client, cfg } = createRommClient(overrideConfig);
    const platformsRes = await client.get("/api/platforms");
    const platforms = Array.isArray(platformsRes.data) ? platformsRes.data : [];

    let serverVersion = null;
    try {
      const hb = await client.get("/api/heartbeat");
      serverVersion = hb.data?.SYSTEM?.VERSION || hb.data?.version || null;
    } catch {
      // Heartbeat is optional across RomM versions
    }

    return {
      success: true,
      serverVersion,
      platformCount: platforms.length,
      platforms: platforms.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name || p.display_name || p.slug,
        romCount: p.rom_count || 0,
        mappedConsoleId: resolveLocalConsoleId(p.slug, cfg.platformMap),
      })),
    };
  } catch (error) {
    const status = error.response?.status;
    const detail =
      error.response?.data?.detail ||
      error.response?.statusText ||
      error.message;
    return {
      success: false,
      error: status ? `HTTP ${status}: ${detail}` : detail,
    };
  }
}

export async function getRommPlatforms(overrideConfig = null) {
  const { client, cfg } = createRommClient(overrideConfig);
  const res = await client.get("/api/platforms");
  const platforms = Array.isArray(res.data) ? res.data : [];
  return platforms.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name || p.display_name || p.slug,
    romCount: p.rom_count || 0,
    mappedConsoleId: resolveLocalConsoleId(p.slug, cfg.platformMap),
  }));
}

function buildAbsoluteAssetUrl(baseURL, assetPath) {
  if (!assetPath) return null;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  const clean = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return `${baseURL}${clean}`;
}

export async function getRommRoms({
  platformId = null,
  search = "",
  limit = 100,
  offset = 0,
} = {}) {
  const { client, cfg, baseURL } = createRommClient();
  const params = { limit, offset };
  if (platformId) params.platform_id = platformId;
  if (search && search.trim()) params.search_term = search.trim();

  const res = await client.get("/api/roms", { params });
  const rawItems = Array.isArray(res.data)
    ? res.data
    : Array.isArray(res.data?.items)
      ? res.data.items
      : [];

  const localRomsByConsole = getAllRoms();

  return rawItems.map((item) => {
    const slug = item.platform_slug || item.platform?.slug || "";
    const consoleId = resolveLocalConsoleId(slug, cfg.platformMap);
    const localList = localRomsByConsole[consoleId] || [];
    const fileName = item.fs_name || item.file_name || `${item.name || item.id}.rom`;
    const localMatch = localList.find(
      (r) =>
        (r.rommId && r.rommId === item.id) ||
        r.romName === fileName,
    );

    const coverUrl = buildAbsoluteAssetUrl(
      baseURL,
      item.url_cover || item.path_cover_large || item.path_cover_small || null,
    );

    return {
      id: item.id,
      name: item.name || path.parse(fileName).name,
      fileName,
      fileSizeBytes: item.fs_size_bytes || 0,
      platformId: item.platform_id,
      platformSlug: slug,
      platformName: item.platform_name || item.platform?.name || slug,
      consoleId,
      summary: item.summary || "",
      developer:
        item.metadatum?.companies?.[0] ||
        item.igdb_metadata?.companies?.[0] ||
        "",
      releaseDate: item.metadatum?.first_release_date
        ? new Date(item.metadatum.first_release_date * 1000)
            .toISOString()
            .slice(0, 10)
        : "",
      coverUrl,
      isDownloaded: Boolean(localMatch && localMatch.romPath && fs.existsSync(localMatch.romPath)),
      localRomName: localMatch?.romName || null,
    };
  });
}

async function downloadCoverFromRomm(client, coverUrl, consoleId, romFileName) {
  if (!coverUrl) return null;
  try {
    const response = await client.get(coverUrl, { responseType: "arraybuffer" });
    let ext = ".jpg";
    try {
      const parsedExt = path.extname(new URL(coverUrl).pathname).toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"].includes(parsedExt)) {
        ext = parsedExt;
      }
    } catch {
      // Keep default .jpg
    }
    const destPath = getCoverPathPC(consoleId, romFileName, ext);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, Buffer.from(response.data));
    return destPath;
  } catch (err) {
    logger.warn(`Could not download RomM cover for ${romFileName}: ${err.message}`);
    return null;
  }
}

export async function downloadRommRom(rommRom, targetConsoleId = null, onProgress = null) {
  const { client, cfg } = createRommClient();
  const consoleId =
    targetConsoleId ||
    rommRom.consoleId ||
    resolveLocalConsoleId(rommRom.platformSlug, cfg.platformMap);

  if (!consoleId) {
    throw new Error("No se pudo determinar la consola destino para esta ROM.");
  }

  const fileName = rommRom.fileName;
  const destPath = getRomPathPC(consoleId, fileName);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  const encodedFileName = encodeURIComponent(fileName);
  const downloadUrl = `/api/roms/${rommRom.id}/content/${encodedFileName}`;

  const response = await client.get(downloadUrl, { responseType: "stream" });
  const totalBytes = Number(response.headers["content-length"]) || rommRom.fileSizeBytes || 0;
  let downloadedBytes = 0;

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(destPath);
    response.data.on("data", (chunk) => {
      downloadedBytes += chunk.length;
      if (onProgress && totalBytes > 0) {
        onProgress({
          rommId: rommRom.id,
          fileName,
          downloadedBytes,
          totalBytes,
          percent: Math.min(100, Math.round((downloadedBytes / totalBytes) * 100)),
        });
      }
    });
    response.data.on("error", reject);
    writer.on("error", reject);
    writer.on("finish", resolve);
    response.data.pipe(writer);
  });

  let coverPath = null;
  if (cfg.autoDownloadCovers && rommRom.coverUrl) {
    coverPath = await downloadCoverFromRomm(client, rommRom.coverUrl, consoleId, fileName);
  }

  const romRecord = {
    romName: fileName,
    system: consoleId,
    title: rommRom.name || path.parse(fileName).name,
    romPath: destPath,
    coverPath,
    description: rommRom.summary || "",
    developer: rommRom.developer || "",
    releaseDate: rommRom.releaseDate || "",
    rommId: rommRom.id,
    rommPlatformSlug: rommRom.platformSlug || "",
  };

  persistRomToJson(romRecord);
  logger.info(`Downloaded ROM from RomM: ${fileName} -> ${destPath}`);

  return {
    success: true,
    rom: romRecord,
  };
}

/**
 * Syncs metadata and covers from RomM for ROMs already present in the local library.
 */
export async function syncRommMetadataForLocalLibrary() {
  const { client, cfg } = createRommClient();
  const localRomsByConsole = getAllRoms();
  const platforms = await getRommPlatforms();

  let matched = 0;
  let coversDownloaded = 0;

  for (const platform of platforms) {
    const consoleId = platform.mappedConsoleId;
    const localRoms = localRomsByConsole[consoleId];
    if (!localRoms || localRoms.length === 0) continue;

    const remoteRoms = await getRommRoms({ platformId: platform.id, limit: 500 });
    const remoteByFile = new Map(remoteRoms.map((r) => [r.fileName.toLowerCase(), r]));
    const remoteById = new Map(remoteRoms.map((r) => [r.id, r]));

    for (const localRom of localRoms) {
      const remote =
        (localRom.rommId && remoteById.get(localRom.rommId)) ||
        remoteByFile.get(localRom.romName.toLowerCase());
      if (!remote) continue;

      let coverPath = localRom.coverPath || null;
      if (cfg.autoDownloadCovers && remote.coverUrl && (!coverPath || !fs.existsSync(coverPath))) {
        coverPath = await downloadCoverFromRomm(client, remote.coverUrl, consoleId, localRom.romName);
        if (coverPath) coversDownloaded++;
      }

      persistRomToJson({
        ...localRom,
        title: remote.name || localRom.title,
        description: remote.summary || localRom.description || "",
        developer: remote.developer || localRom.developer || "",
        releaseDate: remote.releaseDate || localRom.releaseDate || "",
        coverPath,
        rommId: remote.id,
        rommPlatformSlug: remote.platformSlug || platform.slug,
      });
      matched++;
    }
  }

  return {
    success: true,
    matched,
    coversDownloaded,
  };
}

export async function listRommSaves(rommId) {
  const { client } = createRommClient();
  const res = await client.get("/api/saves", { params: { rom_id: rommId } });
  return Array.isArray(res.data) ? res.data : [];
}

export async function downloadLatestRommSave(rommId, consoleId, romFileName) {
  const { client } = createRommClient();
  const saves = await listRommSaves(rommId);
  if (!saves.length) {
    return { success: false, error: "No hay partidas guardadas en RomM para este juego." };
  }

  const sorted = [...saves].sort(
    (a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime(),
  );
  const latest = sorted[0];
  const ext = path.extname(latest.file_name || "") || ".sav";
  const destPath = getSavePathPC(consoleId, romFileName, ext);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  const downloadEndpoint = latest.download_path || `/api/saves/${latest.id}/content/${encodeURIComponent(latest.file_name)}`;
  const res = await client.get(downloadEndpoint, { responseType: "arraybuffer" });
  fs.writeFileSync(destPath, Buffer.from(res.data));

  try {
    updateRomInJson(romFileName, "savePath", destPath, consoleId);
  } catch {
    // Ignore if ROM is not yet in JSON
  }

  return { success: true, savePath: destPath, saveId: latest.id };
}

export async function uploadRommSave(rommId, saveFilePath, emulatorName = "") {
  if (!saveFilePath || !fs.existsSync(saveFilePath)) {
    throw new Error("El archivo de guardado local no existe.");
  }
  const { client } = createRommClient();
  const fileBuffer = fs.readFileSync(saveFilePath);
  const fileName = path.basename(saveFilePath);

  const boundary = `----RomsManagerBoundary${Date.now()}`;
  const headerPart = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="saveFile"; filename="${fileName}"\r\nContent-Type: application/octet-stream\r\n\r\n`,
  );
  const footerPart = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([headerPart, fileBuffer, footerPart]);

  const params = { rom_id: rommId };
  if (emulatorName) params.emulator = emulatorName;

  const res = await client.post("/api/saves", body, {
    params,
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
  });

  return { success: true, data: res.data };
}

/**
 * Scraper-compatible search adapter so EditRomModal can also search metadata on RomM.
 */
export async function searchRommAsScraper(query, consoleId) {
  const cfg = getRommConfig();
  if (!cfg.enabled || !cfg.serverUrl) {
    throw new Error("RomM no está habilitado. Configúralo en Ajustes.");
  }

  const platforms = await getRommPlatforms();
  const matchedPlatform = platforms.find((p) => p.mappedConsoleId === consoleId);
  const results = await getRommRoms({
    platformId: matchedPlatform?.id || null,
    search: query,
    limit: 20,
  });

  return results.map((r) => ({
    id: r.id,
    title: r.name,
    description: r.summary,
    developer: r.developer,
    releaseDate: r.releaseDate,
    coverUrl: r.coverUrl,
    provider: "romm",
  }));
}
