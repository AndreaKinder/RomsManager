# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Storage Location Selection**: Choose between Internal Drive (local storage) or External Drive / SD Card during setup or in Settings
- **Portable Database**: When External Drive is selected, the database and metadata are stored directly on the drive for full portability
- **EmulationStation Synchronization**: Automatic generation and synchronization of `gamelist.xml` and cover art in console directories for Emulation Station, ES-DE, RetroPie, and Batocera
- **Manual ES Sync**: Trigger full `gamelist.xml` synchronization on-demand from the Settings modal
- **Enhanced Setup Wizard**: Redesigned First Run modal with storage type cards, folder browser, and EmulationStation sync toggle

## [0.5.0-alpha] - 2026-05-31

### Added
- **Big Picture Mode**: Immersive full-screen interface tailored for gamepad and keyboard navigation
- **Native OS Visuals**:
  - macOS: Frameless window with native Vibrancy and dynamic Liquid Glass SVG refraction
  - Windows 11: Frameless window with native Acrylic material and integrated window controls
  - Linux: Clean native GTK frame
- **Tabler Icons**: Modern, scalable icon set integration (`@tabler/icons-react`)
- **Scraper Services**: Multi-provider metadata and cover art scraping via ScreenScraper and TheGamesDB
- **Sidebar & Layout Redesign**: Enhanced navigation, quick console access, and collection views
- **Multi-Platform Build Pipeline**: Automated packaging for Linux (`.AppImage`), Windows (`.exe` Setup), and macOS (`.zip`)

### Changed
- Streamlined UI focusing exclusively on a refined dark retro-gaming aesthetic
- Upgraded to React 19 and modern Electron 39 foundation

### Fixed
- Build configuration consistency across platforms with Electron Forge and Webpack
- Synchronized package dependencies and CI release workflows

## [0.2.0-alpha] - 2025-12-02

### Added
- Initial alpha release
- ROM collection management with visual interface
- Console-specific icons for supported systems (NES, SNES, Genesis, GB, GBC, GBA, PS1, Sega CD)
- Generic icon fallback for unsupported systems
- Import ROMs from SD card to PC functionality
- Export ROMs from PC to SD card functionality
- Add individual ROM from PC with file picker
- Automatic ROM detection and system classification
- Support for 18+ retro gaming consoles:
  - NES, SNES, Genesis, Sega CD
  - Game Boy, Game Boy Color, Game Boy Advance
  - PlayStation, PlayStation 2, PSP
  - Nintendo 64, Nintendo DS, Nintendo 3DS
  - GameCube, Wii, Wii U, Switch
- Dark mode UI with modern design
- Collapsible console collections
- ROM count display per console
- Configurable SD card path
- JSON-based ROM registry system
- Real-time console and ROM statistics

### Technical
- Electron-based desktop application
- React frontend with component-based architecture
- Clean code refactoring with:
  - Custom hooks for ROM operations
  - Separated layout components
  - Centralized constants and messages
  - Modular service architecture
- Webpack configuration for assets
- File system operations for ROM management
- Cross-platform support (Windows, macOS, Linux)

### Known Issues
- Electron Forge build issues on Windows (see BUILD.md for workarounds)
- Some console systems may require manual icon mapping
- Export functionality needs SD card path validation

## Version Naming Convention

- **Alpha (0.x.x-alpha)**: Early development, core features being implemented
- **Beta (0.x.x-beta)**: Feature complete, testing and bug fixing phase
- **RC (x.x.x-rc.x)**: Release candidate, final testing before stable
- **Stable (x.x.x)**: Production ready

[Unreleased]: https://github.com/andreakinder/RomsManager/compare/v0.1.0-alpha...HEAD
[0.2.0-alpha]: https://github.com/andreakinder/RomsManager/releases/tag/v0.1.0-alpha
