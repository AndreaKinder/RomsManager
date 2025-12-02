# ROM Manager - Architecture Documentation

## Overview

ROM Manager is an Electron-based desktop application for managing retro gaming ROMs across multiple console systems. It provides functionality to import ROMs from SD cards, organize them by console, and maintain a centralized collection on your PC.

## Technology Stack

- **Framework**: Electron (Node.js + Chromium)
- **Frontend**: React 19
- **Build Tool**: Webpack via Electron Forge
- **Styling**: Custom CSS with modern design system
- **Backend**: Node.js ES Modules
- **Data Storage**: JSON files per console system

## Project Structure

```
RomsManager/
├── src/
│   ├── back/                    # Backend logic
│   │   ├── data/
│   │   │   └── consoles.json    # Console definitions and ROM extensions
│   │   └── services/
│   │       ├── syncService.js   # ROM import/export operations
│   │       ├── uiDataService.js # UI data aggregation
│   │       └── utils/           # Utility functions
│   │           ├── getArrays.js
│   │           ├── getFilters.js
│   │           ├── getJsonRegisters.js
│   │           └── getPaths.js
│   ├── renderer/                # React frontend
│   │   ├── components/
│   │   │   └── roms/
│   │   │       ├── ConsoleCollection.jsx
│   │   │       └── RomCard.jsx
│   │   └── App.jsx
│   ├── styles/
│   │   └── index.css            # Global styles
│   └── window/
│       ├── main.js              # Electron main process
│       └── preload.js           # IPC bridge
└── docs/                        # Documentation
```

## Core Components

### Backend Services

#### SyncService (`syncService.js`)
Handles ROM synchronization between SD card and PC:
- `importRomsPC(sdPath)`: Import ROMs from SD to PC
- `importRomsSD(sdPath)`: Import ROMs from SD to PC (alias)
- `exportRomsToSD(sdPath)`: Export ROMs from PC to SD

#### UIDataService (`uiDataService.js`)
Aggregates data for UI display:
- `getGeneratedConsoles()`: Returns console collections with ROM counts

#### Utility Modules

**getFilters.js**: ROM file extension detection and system identification
- `systemRomDecider(romFileName)`: Determines console system from file extension
- `getExtensionRomFile(romFileName)`: Extracts file extension
- `getSystemIdFromRomExtension(extension)`: Maps extension to system ID

**getPaths.js**: Path generation for PC and SD locations
- `getRomPathPC(consoleId, romFileName)`: PC storage path
- `getRomPathGalic(sdPath, consoleId)`: SD card path (uppercase directory names)
- `getPathSystemJsonSystemsPC()`: JSON metadata storage path

**getArrays.js**: Data extraction from console definitions
- `getSystemIdArray()`: Returns list of all console system IDs

**getJsonRegisters.js**: ROM metadata management
- `getRegisterRomTemplate(romPath)`: Creates ROM metadata object
- `getWriteRomSystemJsonPC(romData)`: Writes ROM to system JSON file

### Frontend Components

#### App.jsx
Main application component managing:
- ROM collection loading
- Import operations
- SD path configuration
- Loading states

#### ConsoleCollection.jsx
Displays a collapsible collection of ROMs for a specific console system.

#### RomCard.jsx
Individual ROM display card showing:
- ROM title
- File name
- Storage path

## Data Flow

### Importing ROMs from SD

```
User clicks "Import from SD"
    ↓
App.jsx → handleImportFromSD()
    ↓
IPC: window.electronAPI.importRomsSD(sdPath)
    ↓
main.js → import-roms-sd handler
    ↓
syncService.importRomsSD(sdPath)
    ↓
For each system:
    getRomPathGalic(sdPath, system) → D:/Roms/{SYSTEM}/
    importRomsToSystemPC(romPath)
        ↓
        For each ROM file:
            systemRomDecider(romName) → Detect system
            getRomPathPC(system, romName) → C:/Users/.../Roms/{system}/
            Copy file
            getRegisterRomTemplate(romPath) → Create metadata
            getWriteRomSystemJsonPC(romData) → Save to JSON
```

### Loading Console Collections

```
App.jsx → useEffect() on mount
    ↓
loadConsoles()
    ↓
IPC: window.electronAPI.getGeneratedConsoles()
    ↓
main.js → get-generated-consoles handler
    ↓
uiDataService.getGeneratedConsoles()
    ↓
For each {system}.json in C:/Users/.../Roms/Json/:
    Read JSON file
    Parse ROM objects
    Count ROMs
    Return { consoleId, consoleName, romCount, roms[] }
    ↓
Filter consoles with romCount > 0
    ↓
Return to React → setState(consoles)
    ↓
Render ConsoleCollection for each console
```

### Adding Single ROM

```
User clicks "Add ROM"
    ↓
IPC: window.electronAPI.addRomFromPC()
    ↓
main.js → Shows file dialog
    ↓
User selects ROM file
    ↓
systemRomDecider(romName) → Detect system
getRomPathPC(system, romName) → Destination
Copy file to PC storage
getRegisterRomTemplate() → Create metadata
getWriteRomSystemJsonPC() → Save to JSON
    ↓
Return success + romName + system
    ↓
App refreshes console list
```

## Storage Structure

### PC Storage

```
C:/Users/{user}/Documents/Roms/
├── Json/
│   ├── gb.json
│   ├── gba.json
│   ├── ps.json
│   └── ...
├── gb/
│   ├── game1.gb
│   └── game2.gb
├── gba/
│   └── game.gba
└── ps/
    └── game.pbp
```

### SD Card Structure

```
D:/Roms/
├── GB/
│   ├── game1.gb
│   └── gamelist.xml
├── GBA/
│   └── game.gba
└── PS/
    └── game.pbp
```

**Note**: SD directories use UPPERCASE names, PC uses lowercase.

## Supported Consoles

Defined in `src/back/data/consoles.json`:

- **NES**: `.nes`
- **SNES/SFC**: `.smc`, `.sfc`
- **Genesis**: `.md`, `.gen`, `.sms`
- **Game Boy**: `.gb`
- **Game Boy Color**: `.gbc`
- **Game Boy Advance**: `.gba`
- **Nintendo 64**: `.z64`, `.v64`, `.n64`
- **Nintendo DS**: `.nds`
- **PlayStation 1**: `.bin`, `.cue`, `.iso`, `.pbp`
- **PlayStation 2**: `.bin`, `.cue`, `.iso`
- **GameCube**: `.gcm`, `.iso`, `.gcz`
- **Wii**: `.iso`, `.wbfs`, `.wad`
- **3DS**: `.3ds`, `.cia`
- **Wii U**: `.wud`, `.wux`, `.rpx`
- **Switch**: `.nsp`, `.xci`, `.nsz`

## IPC Communication

### Main → Renderer

- `get-generated-consoles`: Fetch ROM collections
- `import-roms-sd`: Import from SD card
- `export-roms-to-sd`: Export to SD card
- `add-rom-from-pc`: Add single ROM via file picker

### Security

- Context isolation enabled
- Node integration disabled
- IPC bridge via preload script
- Sandboxed renderer process

## Configuration

### Paths (Configurable in code)

- **PC ROM Storage**: `C:/Users/andre/Documents/Roms/`
- **PC JSON Storage**: `C:/Users/andre/Documents/Roms/Json/`
- **Default SD Path**: `D:/` (user-configurable via UI)

### SD Directory Naming

SD card directories must use UPPERCASE console IDs (e.g., `GB`, `PS`, `GBA`).
