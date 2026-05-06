# ROM Manager

A desktop application for managing retro game ROM collections with SD card sync, Big Picture TV mode, and gamepad support.

## Features

- **Multi-Console Support**: 18+ systems from NES to Nintendo Switch
- **Metadata Scraping**: Integration with ScreenScraper and TheGamesDB to automatically download covers, titles, and descriptions.
- **SD Card Sync**: Bidirectional import/export between PC and SD card
- **Big Picture Mode**: Fullscreen TV interface with gamepad and keyboard navigation
- **Gamepad Support**: Native controller support via Web Gamepad API
- **Custom Collections**: Organize ROMs with custom tags across consoles
- **Direct Launch**: Configure emulators per console and launch ROMs from the app
- **Backup & Restore**: ZIP export/import of your entire library
- **Retro Aesthetic**: Dark pixel-art UI with hard shadows and scanlines

## Tech Stack

- **Electron** + **React 19**
- **Webpack** (via Electron Forge)
- **Custom Retro CSS** + [nes.css](https://nostalgic-css.github.io/NES.css/)
- **Jest** for testing
- **JSON-based** filesystem registry

## Installation

### Requirements

- Node.js 18+
- npm or yarn

### Setup

```bash
git clone https://github.com/andreakinder/RomsManager.git
cd RomsManager
npm install
npm run verify-build  # optional but recommended
```

## Running

### Development

```bash
npm start
```

### Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Build & Distribution

```bash
npm run package    # Package for current platform
npm run make       # Generate distributables (DMG, AppImage, etc.)
npm run publish    # Publish release
```

## Project Structure

```
RomsManager/
├── src/
│   ├── back/               # Main process services (Node.js)
│   ├── renderer/           # React frontend
│   ├── styles/             # Global CSS (retro dark theme + Big Picture)
│   └── window/             # Electron main & preload
├── docs/                   # Project documentation
├── .opencode/              # OpenCode agent ecosystem
├── AGENTS.md               # Root orchestrator for AI agents
├── CHANGELOG.md
└── package.json
```

## Architecture

ROM Manager uses a **classic Electron architecture** with strict process separation:

- **Main Process** (`src/window/main.js`): Node.js with full system access, IPC handlers, emulator spawning, native dialogs.
- **Renderer Process** (`src/renderer/App.jsx`): Isolated React app communicating via `contextBridge` preload script.
- **Data Layer**: JSON files per console stored in `~/.config/romsmanager/database/` (Linux/macOS) or `%APPDATA%\romsmanager\database\` (Windows).

See [`docs/architecture.md`](docs/architecture.md) for detailed architecture documentation.

## Big Picture Mode

A fullscreen TV-optimized view with spatial navigation and gamepad support:

- **Spatial LRUD Navigation**: Directional movement respects visual grid layout
- **Gamepad Polling**: 60fps `requestAnimationFrame` loop with rising-edge detection and hold-repeat
- **Keyboard**: Arrow keys + Enter + Escape
- **Auto-hide Cursor**: Mouse hides after 3 seconds of inactivity

See [`docs/big-picture-mode.md`](docs/big-picture-mode.md) for complete documentation.

## Retro Design

- Zero border-radius everywhere
- Hard box shadows (`4px 4px 0px #000`)
- No CSS transitions for instant arcade-like feedback
- Press Start 2P pixel font for headings
- Scanline background pattern
- Dark palette: `#121212` background, `#8b5cf6` accent

See [`docs/retro-design.md`](docs/retro-design.md) for design decisions.

## Supported Systems

| Console | Extensions |
|---------|-----------|
| NES | `.nes` |
| SNES | `.smc`, `.sfc` |
| Sega Genesis | `.md`, `.gen`, `.sms` |
| Game Boy | `.gb` |
| Game Boy Color | `.gbc` |
| Game Boy Advance | `.gba` |
| Nintendo 64 | `.z64`, `.v64`, `.n64` |
| Nintendo DS | `.nds` |
| PlayStation | `.pbp`, `.bin`, `.cue`, `.iso` |
| PlayStation 2 | `.bin`, `.cue`, `.iso` |
| PSP | `.iso`, `.cso`, `.psp` |
| GameCube | `.gcm`, `.iso`, `.gcz` |
| Nintendo 3DS | `.3ds`, `.cia` |
| Nintendo Switch | `.nsp`, `.xci`, `.nca`, `.nro` |
| Neo Geo | `.zip` |
| Sega CD | `.ccd`, `.cue`, `.iso` |

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — System architecture
- [`docs/big-picture-mode.md`](docs/big-picture-mode.md) — Big Picture mode & gamepad
- [`docs/components.md`](docs/components.md) — Key React components
- [`docs/hooks-and-utils.md`](docs/hooks-and-utils.md) — Hooks & backend services
- [`docs/retro-design.md`](docs/retro-design.md) — Retro design decisions
- [`docs/conventions.md`](docs/conventions.md) — Code conventions
- [`docs/standard-commits.md`](docs/standard-commits.md) — Commit standards
- [`AGENTS.md`](AGENTS.md) — AI agent ecosystem

## License

[MIT](LICENSE)
