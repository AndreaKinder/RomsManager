import { getScraperConfig } from "../configService.js";
import screenScraper from "./screenscraper.js";
import theGamesDB from "./thegamesdb.js";
import fs from "fs";
import path from "path";
import axios from "axios";
import { getCoverPathPC } from "../utils/getPaths.js";

const scrapers = {
  screenscraper: screenScraper,
  thegamesdb: theGamesDB,
};

export async function searchGame(consoleId, query, provider = null) {
  const config = getScraperConfig();
  const selectedProvider = provider || config.defaultScraper;
  
  if (!scrapers[selectedProvider]) {
    throw new Error(`Scraper provider ${selectedProvider} no está soportado.`);
  }

  const credentials = config.credentials[selectedProvider] || {};
  return await scrapers[selectedProvider].search(query, consoleId, credentials);
}

export async function downloadCover(url, destConsoleId, romName, extension = ".jpg") {
  if (!url) throw new Error("No URL provided for cover download.");
  
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    });

    const coverPathPC = getCoverPathPC(destConsoleId, romName, extension);
    const destDir = path.dirname(coverPathPC);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.writeFileSync(coverPathPC, response.data);
    return coverPathPC;
  } catch (error) {
    console.error("Error downloading cover:", error);
    throw new Error("No se pudo descargar la imagen: " + error.message);
  }
}
