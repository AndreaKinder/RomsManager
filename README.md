# 🎮 ROM Manager

A modern desktop application for managing retro gaming ROM collections across multiple console systems.

![App Screen](./screenshots/app-screenshot.png)

![ROM Manager](https://img.shields.io/badge/Electron-App-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

✅ **Multi-Console Support**: Manage ROMs for 16+ retro gaming systems  
✅ **SD Card Import**: Import ROMs directly from SD cards or external drives  
✅ **Smart Detection**: Automatic system detection based on file extensions  
✅ **Organized Storage**: ROMs organized by console system with JSON metadata  
✅ **Modern UI**: Clean, dark-themed interface with retro gaming aesthetics  
✅ **File Management**: Add individual ROMs or bulk import entire collections  
✅ **ROM Editing**: Edit ROM titles and metadata with inline editor  
✅ **Cover Art Support**: Display custom cover images for each ROM  
✅ **Save Management**: Import, export, and manage save files for your ROMs  
✅ **Retro Styling**: Pixel-art font and retro visual effects for authentic gaming feel  
✅ **Quick Export**: One-click ROM and save file export functionality  

## Upcoming Features

🔜 **Gallery View**: Browse your ROM collection with visual grid layouts  
🔜 **Extended Metadata**: Track description, languages, release year, and publisher  
🔜 **Player Info**: Record number of players for each game  
🔜 **Game Ratings**: Personal rating system and difficulty scores  
🔜 **PDF Manual Support**: Import and view game manuals in PDF format  
🔜 **Game Notes**: Add personal notes and comments for each ROM  

## Screenshots

### Main Interface
- View all your ROM collections organized by console
- Expandable/collapsible console sections
- ROM count badges for each system

### Features
- **Add ROM**: Select and import individual ROM files
- **Import from SD**: Bulk import ROMs from SD card or external drive
- **Refresh**: Reload ROM collections

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/RomsManager.git
cd RomsManager

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run package
```

## Usage

### First Time Setup

1. **Launch the application**
2. **Configure SD Path**: Enter your SD card drive letter (e.g., `D:/`, `E:/`)
3. **Import ROMs**: Click "📥 Import from SD" to import your ROM collection

### Adding Individual ROMs

1. Click **"➕ Add ROM"**
2. Browse and select a ROM file from anywhere on your PC
3. The ROM will be automatically:
   - Copied to the appropriate system folder
   - Registered in the system's JSON metadata
   - Displayed in the UI

### Importing from SD Card

1. Insert your SD card
2. Set the correct drive letter in the **SD Path** input
3. Click **"📥 Import from SD"**
4. All ROMs will be imported and organized by system

### Managing Your Collection

#### Browsing ROMs
- Click on any console header to expand/collapse the ROM list
- Each ROM card displays:
  - ROM title with retro pixel-art font
  - Custom cover art (if available)
  - Save file indicator (💾) if a save exists
  - Action buttons for edit, delete, and export

#### Editing ROMs
1. Click the **✏️ Edit** button on any ROM card
2. Modify the ROM title
3. Select a cover image (PNG, JPG, GIF, WebP)
4. Import a save file if available
5. Click **Save** to apply changes

#### Managing Save Files
- **View Save Status**: ROMs with save files show a 💾 icon
- **Export Save**: Click the 💾 icon to export the save file
- **Import Save**: Use the Edit modal to import save files from your PC

#### Exporting ROMs
- Click the **⬇️ Download** button on any ROM card
- Choose export location
- ROM file is copied to your selected directory

## Supported Systems

| Console | Extensions |
|---------|-----------|
| NES | `.nes` |
| SNES/SFC | `.smc`, `.sfc` |
| Sega Genesis | `.md`, `.gen`, `.sms` |
| Game Boy | `.gb` |
| Game Boy Color | `.gbc` |
| Game Boy Advance | `.gba` |
| Nintendo 64 | `.z64`, `.v64`, `.n64` |
| Nintendo DS | `.nds` |
| PlayStation 1 | `.bin`, `.cue`, `.iso`, `.pbp` |
| PlayStation 2 | `.bin`, `.cue`, `.iso` |
| GameCube | `.gcm`, `.iso`, `.gcz` |
| Wii | `.iso`, `.wbfs`, `.wad` |
| Nintendo 3DS | `.3ds`, `.cia` |
| Wii U | `.wud`, `.wux`, `.rpx` |
| Nintendo Switch | `.nsp`, `.xci`, `.nsz` |

## Project Structure

```
RomsManager/
├── src/
│   ├── back/                    # Backend services
│   │   ├── data/
│   │   │   └── consoles.json    # Console definitions
│   │   └── services/
│   │       ├── syncService.js   # Import/export logic
│   │       └── uiDataService.js # Data aggregation
│   ├── renderer/                # React frontend
│   │   ├── assets/
│   │   │   └── fonts/           # Retro gaming fonts
│   │   ├── components/
│   │   │   └── roms/
│   │   │       ├── RomCard.jsx  # ROM display component
│   │   │       └── EditRomModal.jsx # ROM editing modal
│   │   └── App.jsx
│   ├── window/
│   │   ├── main.js             # Electron main process
│   │   └── preload.js          # IPC bridge
│   └── styles/
│       └── index.css           # Global styles with retro theme
├── docs/
│   └── ARCHITECTURE.md         # Detailed architecture docs
└── README.md
```

## Storage Locations

### PC Storage

ROMs are stored in:
```
C:/Users/{user}/Roms/
├── Json/           # Metadata for each system (title, paths, etc.)
├── Covers/         # Cover art images for ROMs
├── Saves/          # Save files organized by console
├── gb/             # Game Boy ROMs
├── gba/            # Game Boy Advance ROMs
├── ps/             # PlayStation 1 ROMs
└── ...
```

#### Metadata Structure (JSON)
Each console has a JSON file storing ROM metadata:
```json
{
  "romName.gba": {
    "title": "Game Title",
    "romName": "romName.gba",
    "romPath": "C:/Users/.../Roms/gba/romName.gba",
    "coverPath": "C:/Users/.../Roms/Covers/gba/romName.png",
    "savePath": "C:/Users/.../Roms/Saves/gba/romName.sav"
  }
}
```

### SD Card Structure

Expected SD card structure:
```
{SD_DRIVE}/Roms/
├── GB/             # Uppercase directory names
├── GBA/
├── PS/
└── ...
```

**Important**: SD card directories must use **UPPERCASE** names (e.g., `GB`, `PS`, `GBA`).

## Development

### Scripts

```bash
npm start          # Start development mode
npm run package    # Build distributable
npm run make       # Create installer
npm test           # Run tests
npm run lint       # Lint code
```

### Tech Stack

- **Electron 39**: Desktop app framework
- **React 19**: UI library
- **Webpack**: Module bundler
- **Electron Forge**: Build tooling
- **Better-SQLite3**: Database for ROM metadata
- **xml2js**: XML parsing for game metadata
- **Press Start 2P Font**: Retro pixel-art typography
- **ES Modules**: Modern JavaScript modules

## Configuration

### Customizing Storage Paths

Edit `src/back/services/utils/getPaths.js`:

```javascript
export function getRomPathPC(consoleId, romFileName) {
  return `C:/Your/Custom/Path/Roms/${consoleId}/${romFileName}`;
}
```

### Adding New Console Systems

Edit `src/back/data/consoles.json`:

```json
{
  "NewConsole": {
    "id": "17",
    "id_name": "newconsole",
    "name": "New Console Name",
    "file": [".ext1", ".ext2"]
  }
}
```

## Troubleshooting

### ROMs Not Importing

1. **Check SD Path**: Ensure the drive letter is correct
2. **Directory Names**: SD directories must be UPPERCASE
3. **File Extensions**: Verify extensions match supported formats
4. **Permissions**: Ensure read/write permissions for storage directories

### System Not Detected

1. **File Extension**: Check if the ROM extension is supported
2. **Console Definitions**: Verify system exists in `consoles.json`
3. **Extension Format**: Extensions must include the dot (e.g., `.gb` not `gb`)

### Cover Images Not Displaying

1. **File Format**: Ensure cover is PNG, JPG, GIF, or WebP
2. **File Permissions**: Check read permissions on cover files
3. **Path Validation**: Verify cover path is correctly stored in JSON metadata

### Save Files Not Loading

1. **Save Path**: Ensure save file exists at the specified path
2. **File Extension**: Common extensions: `.sav`, `.srm`, `.dat`, `.state`
3. **Import Process**: Use the Edit modal to properly import save files

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Credits

- Built with [Electron](https://www.electronjs.org/)
- UI powered by [React](https://react.dev/)
- Bundled with [Electron Forge](https://www.electronforge.io/)

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Made with ❤️ for retro gaming enthusiasts**
