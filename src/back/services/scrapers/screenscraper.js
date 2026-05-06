import axios from "axios";

// Map our console IDs to ScreenScraper System IDs
const SYSTEM_MAP = {
  nes: 3,
  snes: 4,
  n64: 14,
  gb: 9,
  gbc: 10,
  gba: 12,
  nds: 15,
  psx: 57,
  ps2: 58,
  psp: 61,
  megadrive: 1,
  genesis: 1,
  mastersystem: 2,
};

export default {
  async search(query, consoleId, credentials = {}) {
    const devId = credentials.developerId || "soft123";
    const devPassword = credentials.developerPassword || "password";
    const softName = "RomsManager";
    
    // Screenscraper needs dev credentials. It also allows user credentials but dev is required.
    // Since we don't have real credentials, we will mock the response if it fails or simulate it.
    // For a real implementation, the user needs to provide Dev ID / Password or we hardcode a free one.
    // Their API is: https://www.screenscraper.fr/api2/jeuRecherche.php
    
    const sysId = SYSTEM_MAP[consoleId.toLowerCase()] || 0;
    
    try {
      // NOTE: Using ScreenScraper API v2 requires dev keys.
      // We implement the structure but it might return 401 if keys are invalid.
      const url = `https://www.screenscraper.fr/api2/jeuRecherche.php?devid=${devId}&devpassword=${devPassword}&softname=${softName}&output=json&recherche=${encodeURIComponent(query)}` + (sysId ? `&systemeid=${sysId}` : "");
      
      const response = await axios.get(url);
      const data = response.data;
      
      if (!data.response || !data.response.jeux) return [];
      
      const games = Array.isArray(data.response.jeux) ? data.response.jeux : [data.response.jeux];
      
      return games.map(game => {
        const title = game.noms && game.noms.nom_ss ? game.noms.nom_ss : "Unknown";
        const developer = game.developpeur ? game.developpeur.text : "";
        const releaseDate = game.dates && game.dates.date ? game.dates.date.text : "";
        const description = game.synopsis && game.synopsis.synopsis ? (Array.isArray(game.synopsis.synopsis) ? game.synopsis.synopsis[0].text : game.synopsis.synopsis.text) : "";
        
        // Find a 2D boxart (media_type = box-2D)
        let coverUrl = null;
        if (game.medias && game.medias.media) {
          const medias = Array.isArray(game.medias.media) ? game.medias.media : [game.medias.media];
          const boxart = medias.find(m => m.type === "box-2D" || m.type === "box-3D");
          if (boxart) {
            coverUrl = boxart.url;
          }
        }

        return {
          id: game.id,
          title,
          developer,
          releaseDate,
          description,
          coverUrl
        };
      });
    } catch (error) {
      console.warn("ScreenScraper API request failed. Returning mock data or empty array.", error.message);
      // For demonstration/fallback when no API key is present
      if (query.toLowerCase().includes("mario")) {
        return [{
          id: "mock1",
          title: "Super Mario Mock (ScreenScraper)",
          developer: "Nintendo",
          releaseDate: "1990",
          description: "A mock description for testing scraping without API keys.",
          coverUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
        }];
      }
      return [];
    }
  }
};
