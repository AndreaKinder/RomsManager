# 🎮 ROM Manager

A modern desktop application for managing retro gaming ROM collections across multiple console systems.

![ROM Manager](https://img.shields.io/badge/Electron-App-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

✅ **Multi-Console Support**: Manage ROMs for 16+ retro gaming systems  
✅ **SD Card Import**: Import ROMs directly from SD cards or external drives  
✅ **Smart Detection**: Automatic system detection based on file extensions  
✅ **Organized Storage**: ROMs organized by console system with JSON metadata  
✅ **Modern UI**: Clean, dark-themed interface with smooth animations  
✅ **File Management**: Add individual ROMs or bulk import entire collections  

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

### Browsing Your Collection

- Click on any console header to expand/collapse the ROM list
- Each ROM card displays:
  - ROM title
  - File name
  - Storage path

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
│   │   ├── components/
│   │   │   └── roms/
│   │   └── App.jsx
│   ├── window/
│   │   ├── main.js             # Electron main process
│   │   └── preload.js          # IPC bridge
│   └── styles/
│       └── index.css
├── docs/
│   └── ARCHITECTURE.md         # Detailed architecture docs
└── README.md
```

## Storage Locations

### PC Storage

ROMs are stored in:
```
C:/Users/{user}/Documents/Roms/
├── Json/           # Metadata for each system
├── gb/             # Game Boy ROMs
├── gba/            # Game Boy Advance ROMs
├── ps/             # PlayStation 1 ROMs
└── ...
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

- **Electron**: Desktop app framework
- **React 19**: UI library
- **Webpack**: Module bundler
- **Electron Forge**: Build tooling
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
