# ROM Manager

> Gestor de ROMs retro con interfaz de escritorio, sincronización con tarjeta SD, y modo Big Picture con soporte de gamepad.

## 🇪🇸 Descripción

ROM Manager es una aplicación de escritorio construida con **Electron** y **React** para organizar, visualizar y lanzar ROMs de consolas retro. Soporta 18+ sistemas (desde NES hasta Nintendo Switch), sincronización bidireccional con tarjetas SD, copias de seguridad ZIP, y un modo Big Picture optimizado para televisores y control de gamepad.

## 🎮 Características Principales

- **Gestión de ROMs**: Importar, exportar, editar metadatos, carátulas, manuales y partidas guardadas.
- **Scraping de Metadatos**: Integración con ScreenScraper y TheGamesDB para descargar automáticamente carátulas, títulos y descripciones de tus juegos.
- **Soporte multi-consola**: NES, SNES, Genesis, GB, GBC, GBA, N64, NDS, PS1, PS2, PSP, GameCube, 3DS, Switch, Neo Geo, Sega CD, y más.
- **Sincronización SD**: Importar ROMs desde tarjeta SD al PC y exportar del PC a la SD.
- **Modo Big Picture**: Interfaz fullscreen tipo "Steam Big Picture" para navegar con gamepad o teclado desde el sillón.
- **Colecciones personalizadas**: Agrupar ROMs por etiquetas personalizadas (`collections`) independientemente de la consola.
- **Lanzamiento directo**: Configurar emuladores por consola y lanzar ROMs directamente desde la app.
- **Copias de seguridad**: Exportar/importar backups ZIP de toda la biblioteca.
- **Estética retro**: UI oscura con tipografía pixel-art, sombras duras y bordes cuadrados inspirada en 8-bits.

## 🛠 Stack Tecnológico

- **Framework**: [Electron](https://www.electronjs.org/) + [React 19](https://react.dev/)
- **Bundler**: Webpack (via Electron Forge)
- **CSS**: Estilos custom retro + [nes.css](https://nostalgic-css.github.io/NES.css/)
- **Tipografía**: Press Start 2P
- **Testing**: [Jest](https://jestjs.io/) + Testing Library
- **Base de datos**: JSON files (filesystem-based registry)
- **Empaquetado**: Electron Forge (DMG, ZIP, AppImage, DEB, RPM, Squirrel)

## 📦 Instalación

### Requisitos previos

- [Node.js](https://nodejs.org/) 18+
- npm o yarn

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/andreakinder/RomsManager.git
cd RomsManager

# 2. Instalar dependencias
npm install

# 3. Verificar configuración de build (opcional pero recomendado)
npm run verify-build
```

> **Nota**: La instalación puede requerir herramientas nativas para compilar dependencias como `better-sqlite3`. En macOS/Linux asegurate de tener Python y un compilador C++ disponible.

## 🚀 Cómo correr

### Desarrollo

```bash
# Iniciar la app en modo desarrollo con hot-reload
npm start
```

### Testing

```bash
# Ejecutar tests unitarios
npm test

# Modo watch
npm run test:watch

# Con cobertura
npm run test:coverage
```

### Build y distribución

```bash
# Empaquetar para la plataforma actual
npm run package

# Generar distribuibles (DMG, AppImage, etc.)
npm run make

# Publicar release (requiere configuración de GitHub en forge.config.js)
npm run publish
```

## 📁 Estructura del Proyecto

```
RomsManager/
├── src/
│   ├── back/                       # Lógica del proceso principal (Node.js)
│   │   ├── data/                   # Datos estáticos (consoles.json, form data, etc.)
│   │   └── services/               # Servicios de negocio
│   │       ├── backupService.js    # Backups ZIP
│   │       ├── configService.js    # Configuración persistente
│   │       ├── editService.js      # Edición de ROMs
│   │       ├── syncService.js      # Sincronización PC ↔ SD
│   │       ├── uiDataService.js    # Generación de datos para la UI
│   │       └── utils/              # Utilidades
│   │           ├── getArrays.js
│   │           ├── getFilters.js
│   │           ├── getJsonUtils.js
│   │           ├── getPaths.js
│   │           └── logger.js
│   ├── renderer/                   # Frontend React
│   │   ├── components/             # Componentes React
│   │   │   ├── bigpicture/         # Modo Big Picture
│   │   │   ├── layout/             # Layout (header, footer, modales globales)
│   │   │   └── roms/               # Componentes de ROMs (cards, modales)
│   │   ├── constants/              # Strings y mensajes centralizados
│   │   ├── hooks/                  # Custom hooks
│   │   └── App.jsx                 # Entry point del renderer
│   ├── styles/                     # CSS global
│   │   ├── index.css               # Estilos principales (retro dark theme)
│   │   └── bigpicture.css          # Estilos del modo Big Picture
│   └── window/                     # Configuración de Electron
│       ├── main.js                 # Proceso principal (IPC, ventana, protocolos)
│       └── preload.js              # Preload script (contextBridge)
├── docs/                           # Documentación del proyecto
│   ├── architecture.md             # Arquitectura general
│   ├── big-picture-mode.md         # Documentación del modo Big Picture
│   ├── components.md               # Documentación de componentes clave
│   ├── conventions.md              # Convenciones de código
│   ├── hooks-and-utils.md          # Hooks y utilidades
│   ├── retro-design.md             # Decisiones de diseño retro
│   └── standard-commits.md         # Estándar de commits
├── .opencode/                      # Ecosistema de agentes OpenCode
│   ├── agents/                     # Definiciones de agentes
│   └── skills/                     # Skills locales
├── AGENTS.md                       # Orquestador raíz de agentes
├── CHANGELOG.md                    # Historial de cambios
├── forge.config.js                 # Configuración de Electron Forge
├── jest.config.js                  # Configuración de Jest
├── package.json
└── README.md
```

## 🎯 Arquitectura General

ROM Manager sigue una arquitectura **Electron clásica** separada en dos procesos:

1. **Main Process** (`src/window/main.js`): Node.js con acceso completo al sistema de archivos, diálogos nativos, y lanzamiento de emuladores.
2. **Renderer Process** (`src/renderer/App.jsx`): React aislado vía `contextIsolation`. Comunicación con el main exclusivamente a través del `preload.js` y `ipcRenderer.invoke`.

Los datos se persisten en el filesystem como archivos JSON por consola (ej: `nes.json`, `snes.json`) en un directorio de base de datos (`~/.config/romsmanager/database/` en Linux/macOS, `%APPDATA%\romsmanager\database\` en Windows).

Para más detalles, ver [`docs/architecture.md`](docs/architecture.md).

## 🕹 Big Picture Mode

El modo Big Picture transforma la interfaz en una experiencia fullscreen optimizada para TVs y gamepads:

- **Navegación espacial**: Movimiento LRUD (Left/Right/Up/Down) que respeta la posición visual de las tarjetas en la grilla.
- **Gamepad**: Soporte nativo vía `navigator.getGamepads()` con polling a 60fps, detección de rising edge, y repetición al mantener presionado.
- **Teclado**: Flechas direccionales + Enter para seleccionar + Escape para salir.
- **Auto-hide cursor**: El cursor del mouse se oculta tras 3 segundos de inactividad.

Ver documentación completa en [`docs/big-picture-mode.md`](docs/big-picture-mode.md).

## 🎨 Diseño Retro

La estética visual busca evocar interfaces de consolas retro y computadoras de los 80s/90s:

- **Sin border-radius**: Todos los elementos tienen esquinas rectas (`border-radius: 0`).
- **Sombras duras**: `box-shadow: 4px 4px 0px #000` en lugar de sombras difusas.
- **Transiciones deshabilitadas**: `transition: none` para respuesta instantánea tipo "arcade".
- **Scanlines**: Fondo con patrón de líneas horizontales sutiles.
- **Tipografía pixel**: Headers en **Press Start 2P**, cuerpo en monospaced.
- **Paleta oscura**: Fondo `#121212`, superficies `#212121`, acento púrpura `#8b5cf6`.

Ver más en [`docs/retro-design.md`](docs/retro-design.md).

## 🤖 Agentes del Proyecto

Este proyecto usa el ecosistema **OpenCode** con agentes especializados:

- `@docs` - Documentación y estándares
- `@testing` - Testing y QA
- `@debugger` - Diagnóstico de errores
- `@architecture` - Decisiones de arquitectura
- `@clean-js` - Clean code y anti-hardcoding
- `@git-manager` - Operaciones de Git
- `@git-merge` - Merge de ramas
- `@project-setup` - Setup/reconfiguración

Ver [`AGENTS.md`](AGENTS.md) para instrucciones completas.

## 📄 Licencia

[MIT](LICENSE)

---

## 🇬🇧 English Version (For AI Agents)

**ROM Manager** is a desktop Electron + React application for managing retro game ROMs. It supports 18+ console systems, bidirectional SD card sync, ZIP backups, and a Big Picture TV/gamepad mode.

### Tech Stack
- Electron + React 19
- Webpack via Electron Forge
- Custom retro CSS + nes.css
- Jest for testing
- JSON-based filesystem registry

### Key Directories
- `src/back/services/` — Business logic (sync, config, backup, UI data)
- `src/renderer/components/` — React components
- `src/window/` — Electron main process and preload
- `docs/` — Project documentation
- `.opencode/` — Agent ecosystem

### Communication Pattern
Renderer → `window.electronAPI` (preload) → `ipcRenderer.invoke` → Main Process IPC handlers → filesystem / child_process.

### Big Picture Mode
- Spatial LRUD navigation
- Gamepad polling via `requestAnimationFrame`
- Keyboard support (Arrow keys, Enter, Escape)
- Auto-hide cursor after 3s inactivity

### Retro Design Decisions
- Zero border-radius everywhere
- Hard box-shadows (4px 4px 0px #000)
- Disabled CSS transitions for instant feedback
- Scanline background pattern
- Press Start 2P pixel font for headings
- Dark palette: #121212 background, #8b5cf6 accent
