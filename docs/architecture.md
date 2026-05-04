# Arquitectura de ROM Manager

## 🇪🇸 Visión General

ROM Manager está construido sobre una arquitectura **clásica de Electron** con separación estricta entre el proceso principal (Node.js) y el proceso de renderizado (React). Esta separación garantiza seguridad (`contextIsolation: true`, `nodeIntegration: false`) y mantiene la lógica de sistema fuera del frontend.

## Diagrama de Flujo de Datos

```
┌─────────────────┐     ipcRenderer.invoke      ┌──────────────────┐
│  React Renderer │  ─────────────────────────>  │  Electron Main   │
│  (App.jsx)      │                            │  (main.js)       │
│                 │  <─────────────────────────  │                  │
└─────────────────┘     contextBridge / preload  └──────────────────┘
        │                                                   │
        │                                                   │
        v                                                   v
┌─────────────────┐                               ┌──────────────────┐
│  Components     │                               │  Services        │
│  - RomCard      │                               │  - syncService   │
│  - ConsoleList  │                               │  - configService │
│  - BigPicture   │                               │  - uiDataService │
│  - Modals       │                               │  - backupService │
└─────────────────┘                               └──────────────────┘
                                                          │
                                                          v
                                                   ┌──────────────┐
                                                   │  Filesystem  │
                                                   │  - JSON DB   │
                                                   │  - ROM files │
                                                   │  - Covers    │
                                                   └──────────────┘
```

## Proceso Principal (Main Process)

Archivo: `src/window/main.js`

Responsabilidades:
- Crear y gestionar la ventana de Electron (`BrowserWindow`)
- Registrar el protocolo personalizado `media://` para servir imágenes locales de carátulas
- Manejar todos los handlers IPC
- Lanzar emuladores via `child_process.spawn`
- Diálogos nativos (`dialog.showOpenDialog`, `dialog.showSaveDialog`)

### Protocolo `media://`

Dado que Electron con `webSecurity: true` no permite cargar archivos locales directamente en el renderer, se registró un protocolo privilegiado:

```javascript
protocol.registerSchemesAsPrivileged([
  {
    scheme: "media",
    privileges: { secure: true, supportFetchAPI: true, bypassCSP: true },
  },
]);
```

El handler decodifica la URL, normaliza el path según la plataforma, y devuelve el archivo vía `net.fetch(url.pathToFileURL(...))`.

### Handlers IPC Principales

| Handler | Descripción |
|---------|-------------|
| `get-generated-consoles` | Lee el directorio de JSONs y devuelve consolas con ROMs |
| `get-all-roms` | Devuelve todas las ROMs organizadas por consola |
| `add-rom-from-pc` | Copia una ROM al directorio de la consola y la registra en JSON |
| `edit-rom-title` / `edit-rom-name` | Edita metadatos de una ROM |
| `delete-rom` | Elimina una ROM del JSON y del filesystem |
| `launch-rom` | Lanza el emulador configurado con la ROM seleccionada |
| `import-roms-sd` / `export-roms-to-sd` | Sincronización con tarjeta SD |
| `export-backup` / `import-backup` | Copias de seguridad ZIP |
| `enter-big-picture` / `exit-big-picture` | Controla fullscreen de la ventana |
| `get-emulator-for-console` / `set-emulator` | Configuración de emuladores |

## Proceso de Renderizado (Renderer Process)

Archivo entry point: `src/renderer/App.jsx`

Responsabilidades:
- Estado global de la aplicación (consolas, colecciones, búsqueda, modales)
- Renderizado condicional de vistas (first-run, path-missing, normal, big-picture)
- Filtrado de consolas y ROMs por query de búsqueda
- Coordinación entre componentes y custom hooks

### Flujo de Inicialización

1. **First Run Check**: `App.jsx` verifica si existe `romsBasePath` configurado. Si no, muestra `FirstRunModal`.
2. **Path Validation**: Si el path configurado ya no existe, muestra `PathMissingModal`.
3. **Carga de datos**: Llama a `window.electronAPI.getGeneratedConsoles()` y procesa las colecciones personalizadas.
4. **Renderizado**: Muestra `AppHeader` + `ConsoleList`/`EmptyState` + `AppFooter`.

### Estructura de Componentes

```
App.jsx
├── AppHeader
│   ├── SearchInput
│   ├── ActionButtons (Add ROM, Settings, Big Picture, Collections Toggle)
├── AppContent
│   ├── LoadingState
│   ├── EmptyState
│   ├── ConsoleList
│   │   ├── ConsoleCollection (por consola)
│   │   │   ├── RomCard (por ROM)
│   │   │   │   ├── EditRomModal
│   │   │   │   ├── ManualViewerModal
│   ├── SearchNoResults
├── AppFooter
│   └── Stats (consoles, ROMs, filtered count)
├── SelectConsoleModal
├── SettingsModal
├── FirstRunModal
├── PathMissingModal
└── BigPictureView (vista alternativa fullscreen)
```

## Servicios del Backend

### `configService.js`

Gestiona la configuración persistente del usuario en un archivo JSON:

- **Ubicación**:
  - Linux/macOS: `~/.config/romsmanager/config.json`
  - Windows: `%APPDATA%\romsmanager\config.json`
- **Datos almacenados**: `romsBasePath`, `emulators` (mapeo consoleId → path).

### `uiDataService.js`

Genera los datos que consume la UI:

- `getGeneratedConsoles()`: Lee los archivos JSON del directorio de sistemas, parsea las ROMs, y devuelve objetos de consola con `consoleId`, `consoleName`, `romCount`, `roms`.
- `getAllRoms()`: Devuelve todas las ROMs indexadas por `consoleId`.
- `fixCoverPath()`: Si una carátula no se encuentra en la ruta registrada, intenta encontrarla con otras extensiones (`.jpg`, `.png`, `.webp`, etc.).
- `getAllCustomCollections()`: Extrae colecciones personalizadas del campo `collections` de cada ROM.

### `syncService.js`

Maneja la sincronización de archivos entre PC y tarjeta SD:

- `importRomsPC(sdPath)`: Itera por todos los sistemas, lee ROMs del directorio de la SD (`sdPath/Roms/<SYSTEM>/`), y las copia al PC registrándolas en JSON.
- `exportAllRomsPcToGalic(sdPath)`: Copia todas las ROMs del PC al directorio correspondiente de la SD.
- `exportRomCopy()` / `exportSaveCopy()`: Exportación individual vía diálogo "Guardar como".

### `backupService.js`

Crea y restaura copias de seguridad ZIP de toda la biblioteca (ROMs, saves, covers, manuals, JSONs).

### `editService.js`

Wrapper simple sobre `updateRomInJson` para editar título y nombre de archivo de una ROM.

## Persistencia de Datos

### Estructura del JSON de ROM

Cada consola tiene su propio archivo JSON (ej: `nes.json`) con este esquema:

```json
{
  "SuperMarioBros.nes": {
    "romName": "SuperMarioBros.nes",
    "system": "nes",
    "title": "Super Mario Bros",
    "romPath": "/home/user/Roms/Roms/nes/SuperMarioBros.nes",
    "savePath": "/home/user/Roms/Saves/nes/SuperMarioBros.sav",
    "coverPath": "/home/user/Roms/Covers/nes/SuperMarioBros.png",
    "manualPath": "/home/user/Roms/Manuals/nes/SuperMarioBros.pdf",
    "collections": ["Plataformas", "Clásicos"]
  }
}
```

### Directorios del Usuario

```
<RomsBasePath>/
├── Roms/
│   ├── nes/
│   ├── snes/
│   └── ...
├── Saves/
│   ├── nes/
│   └── ...
├── Covers/
│   ├── nes/
│   └── ...
├── Manuals/
│   ├── nes/
│   └── ...
└── .config/romsmanager/database/
    ├── nes.json
    ├── snes.json
    └── ...
```

## Seguridad

- `contextIsolation: true`: El preload es el único puente entre renderer y main.
- `nodeIntegration: false`: React no tiene acceso directo a Node.js APIs.
- `webSecurity: true`: No se pueden cargar archivos `file://` directamente; se usa el protocolo `media://`.
- Todas las operaciones de filesystem pasan por IPC handlers validados en el main process.

---

## 🇬🇧 English Version (For AI Agents)

### Architecture Overview

ROM Manager uses a **classic Electron architecture** with strict separation between the main process (Node.js) and the renderer process (React). Communication happens exclusively via `ipcRenderer.invoke` through a `contextBridge` preload script.

### Data Flow

1. React components call `window.electronAPI.*` methods
2. Preload forwards to `ipcRenderer.invoke(channel, ...args)`
3. Main process IPC handlers execute filesystem operations via services
4. Results return through the IPC promise chain back to React

### Key Services

| Service | Responsibility |
|---------|---------------|
| `configService` | Persistent user config (paths, emulators) |
| `uiDataService` | Read JSON DB, fix cover paths, build console/collection objects |
| `syncService` | Bidirectional PC ↔ SD card file sync |
| `backupService` | ZIP export/import of entire library |
| `editService` | ROM metadata editing |

### Persistence Layer

- JSON files per console in `~/.config/romsmanager/database/`
- ROM files, saves, covers, and manuals stored in user-configured base path
- No SQL database; filesystem is the source of truth

### Security Model

- `contextIsolation: true`
- `nodeIntegration: false`
- Custom `media://` protocol for local image serving
- All fs operations happen in main process only
