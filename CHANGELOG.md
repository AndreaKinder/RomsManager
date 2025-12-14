# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
