import axios from "axios";

const SYSTEM_MAP = {
  nes: 7, // Nintendo Entertainment System (NES)
  snes: 6, // Super Nintendo (SNES)
  n64: 2, // Nintendo 64
  gb: 4, // Game Boy
  gbc: 41, // Game Boy Color
  gba: 5, // Game Boy Advance
  nds: 8, // Nintendo DS
  psx: 10, // Sony Playstation
  ps2: 11, // Sony Playstation 2
  psp: 13, // Sony Playstation Portable
  megadrive: 18, // Sega Genesis
  genesis: 18, // Sega Genesis
  mastersystem: 35, // Sega Master System
};

export default {
  async search(query, consoleId, credentials = {}) {
    // TheGamesDB uses an API key for the new v1 API. 
    // They used to have a free public one but it's restricted now.
    const apiKey = credentials.apiKey || "YOUR_API_KEY"; 
    const sysId = SYSTEM_MAP[consoleId.toLowerCase()];
    
    try {
      let url = `https://api.thegamesdb.net/v1/Games/ByGameName?name=${encodeURIComponent(query)}&apikey=${apiKey}&fields=overview,developers,publishers,release_date&include=boxart`;
      if (sysId) {
        url += `&filter[platform]=${sysId}`;
      }

      const response = await axios.get(url);
      const data = response.data;
      
      if (!data.data || !data.data.games) return [];
      
      const games = data.data.games;
      const images = data.include ? data.include.boxart : {};
      
      return games.map(game => {
        const coverData = images.data ? images.data[game.id] : null;
        let coverUrl = null;
        if (coverData && coverData.length > 0) {
          const frontCover = coverData.find(c => c.side === "front");
          if (frontCover) {
            coverUrl = `https://cdn.thegamesdb.net/images/medium/${frontCover.filename}`;
          }
        }
        
        return {
          id: game.id,
          title: game.game_title,
          developer: game.developers ? game.developers.join(", ") : "",
          releaseDate: game.release_date || "",
          description: game.overview || "",
          coverUrl
        };
      });
      
    } catch (error) {
      console.warn("TheGamesDB API request failed. Returning mock data.", error.message);
      // Fallback mock
      if (query.toLowerCase().includes("mario")) {
        return [{
          id: "mock2",
          title: "Super Mario Mock (TheGamesDB)",
          developer: "Nintendo",
          releaseDate: "1990",
          description: "Mock description from TheGamesDB module.",
          coverUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png"
        }];
      }
      return [];
    }
  }
};
