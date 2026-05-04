# Hooks y Utilidades

## 🇪🇸 Custom Hooks

### `useRomOperations`

**Ubicación**: `src/renderer/hooks/useRomOperations.js`

Hook central para operaciones de ROMs que requieren estado de carga (`isLoading`). Expone operaciones async con confirmación del usuario y manejo de errores.

#### Interfaz

```javascript
const {
  isLoading,           // boolean — bloquea UI durante operaciones
  handleImportFromSD,  // (sdPath, onSuccess) => void
  handleExportToSD,    // (sdPath) => void
  handleAddRomFromPC,  // (selectedConsole, romFilePath, onSuccess) => void
  handleAddSaveFromPC, // (romName, consoleId, saveFilePath) => void
} = useRomOperations();
```

#### Comportamiento

- **Guarda contra doble ejecución**: Si `isLoading` es `true`, todas las operaciones retornan temprano.
- **Confirmación del usuario**: Usa `window.confirm()` antes de importar/exportar grandes cantidades de ROMs.
- **Alertas**: Muestra `alert()` con mensajes de éxito o error centralizados desde `constants/messages.js`.
- **Callback de refresco**: Después de una operación exitosa, invoca `onSuccess()` (típicamente `loadConsoles` de `App.jsx`).

---

## 🇪🇸 Servicios del Backend

### `configService.js`

**Ubicación**: `src/back/services/configService.js`

Gestiona la configuración persistente del usuario en un archivo JSON.

#### Funciones Exportadas

| Función | Retorno | Descripción |
|---------|---------|-------------|
| `getRomsBasePath()` | `string \| null` | Ruta base configurada para ROMs |
| `setRomsBasePath(basePath)` | `void` | Guarda nueva ruta base |
| `hasRomsBasePath()` | `boolean` | Verifica si hay ruta configurada |
| `getEmulators()` | `Object` | Mapa consoleId → path de emulador |
| `getEmulatorForConsole(consoleId)` | `string \| null` | Path del emulador para una consola |
| `setEmulator(consoleId, emulatorPath)` | `void` | Asigna emulador a consola |
| `removeEmulator(consoleId)` | `void` | Elimina emulador de consola |
| `getDatabasePath()` | `string` | Ruta al directorio de JSONs de sistema |

#### Ubicación del Config

- **Linux/macOS**: `~/.config/romsmanager/config.json`
- **Windows**: `%APPDATA%\romsmanager\config.json`

---

### `syncService.js`

**Ubicación**: `src/back/services/syncService.js`

Responsable de la sincronización de archivos entre PC y tarjeta SD.

#### Funciones Exportadas

| Función | Descripción |
|---------|-------------|
| `importRomsPC(sdPath)` | Importa ROMs desde `sdPath/Roms/<SYSTEM>/` al PC, registrándolas en JSON |
| `exportAllRomsPcToGalic(sdPath)` | Exporta todas las ROMs del PC a `sdPath/Roms/<SYSTEM>/` |
| `exportRomCopy(sourcePath, dialog)` | Exporta una ROM individual via diálogo "Guardar como" |
| `exportSaveCopy(sourcePath, dialog)` | Exporta un save file individual via diálogo "Guardar como" |

#### Lógica Interna

`syncSingleRom(sourcePath, destinationPath, shouldRegister)`:
1. Identifica el sistema por extensión del archivo via `identifyRomSystem()`
2. Crea directorios destino si no existen
3. Copia el archivo
4. Si `shouldRegister === true`, crea un template JSON y lo persiste

---

### `uiDataService.js`

**Ubicación**: `src/back/services/uiDataService.js`

Genera los datos que consume la interfaz de usuario.

#### Funciones Exportadas

| Función | Retorno | Descripción |
|---------|---------|-------------|
| `getGeneratedConsoles()` | `Array<Console>` | Consolas con ROMs, nombre mapeado, y contadores |
| `getAllRoms()` | `Object<consoleId, Array<Rom>>` | Todas las ROMs indexadas por sistema |
| `getCollectionObject(roms)` | `Object` | Agrupa ROMs por colecciones |
| `getAllCustomCollections(roms)` | `Array<Collection>` | Lista de colecciones personalizadas |

#### `fixCoverPath`

Si una carátula registrada no existe en el filesystem, `uiDataService` intenta encontrarla con extensiones alternativas:

```javascript
const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
```

Esto hace que la app sea resiliente a cambios de formato de imagen.

---

### `backupService.js`

**Ubicación**: `src/back/services/backupService.js`

Crea y restaura backups ZIP de toda la biblioteca.

| Función | Descripción |
|---------|-------------|
| `exportBackup(destinationPath)` | Comprime ROMs, saves, covers, manuals, y JSONs en un ZIP |
| `importBackup(zipPath)` | Extrae un ZIP de backup y restaura los archivos |

---

### `editService.js`

**Ubicación**: `src/back/services/editService.js`

Wrapper simple para edición de metadatos de ROMs.

| Función | Descripción |
|---------|-------------|
| `editRomTitle(romName, newRomTitle)` | Actualiza el campo `title` en el JSON |
| `editRomName(romName, newRomName)` | Actualiza el campo `romName` en el JSON |

---

## 🇪🇸 Utilidades

### `getPaths.js`

**Ubicación**: `src/back/services/utils/getPaths.js`

Centraliza la resolución de rutas del filesystem.

| Función | Ejemplo de Retorno |
|---------|-------------------|
| `getRomPathPC(consoleId, romFileName)` | `~/Roms/Roms/nes/Mario.nes` |
| `getSavePathPC(consoleId, romFileName)` | `~/Roms/Saves/nes/Mario.sav` |
| `getCoverPathPC(consoleId, romFileName, ext)` | `~/Roms/Covers/nes/Mario.png` |
| `getManualPathPC(consoleId, romFileName)` | `~/Roms/Manuals/nes/Mario.pdf` |
| `getRomPathGalic(sdPath, consoleId)` | `D:/Roms/NES` |
| `getPathSystemJsonSystemsPC()` | `~/.config/romsmanager/database` |

Usa `getRomsBasePath()` del `configService`; si no está configurado, fallback a `~/Roms`.

---

### `getJsonUtils.js`

**Ubicación**: `src/back/services/utils/getJsonUtils.js`

Operaciones CRUD sobre los archivos JSON de sistemas.

| Función | Descripción |
|---------|-------------|
| `createRomTemplate(romFinalPath, system)` | Crea objeto ROM básico a partir del path |
| `persistRomToJson(romObject)` | Agrega/actualiza una ROM en el JSON de su sistema |
| `updateRomInJson(romName, field, newValue)` | Actualiza un campo específico. Soporta renombrado físico de archivos para `romName` y `romPath` |
| `deleteRomFromJson(romName)` | Elimina la ROM del JSON y borra el archivo físico |
| `updateRomCollections(romName, collections)` | Actualiza el array de colecciones personalizadas |

#### Renombrado Inteligente

Cuando se actualiza `romName` o `romPath`, la utilidad también renombra el archivo físico en el filesystem para mantener la consistencia:

```javascript
if (fs.existsSync(oldRomPath)) {
  fs.renameSync(oldRomPath, newRomPath);
}
```

---

### `getFilters.js`

**Ubicación**: `src/back/services/utils/getFilters.js`

Identifica el sistema de una ROM a partir de su extensión de archivo. Usado durante la importación para clasificar automáticamente las ROMs.

---

### `getArrays.js`

**Ubicación**: `src/back/services/utils/getArrays.js`

Utilidades para manipulación de arrays. Usado principalmente para obtener listas de IDs de sistemas soportados.

---

### `logger.js`

**Ubicación**: `src/back/services/utils/logger.js`

Wrapper de logging con prefijos para diferentes operaciones (sync, export, import). Facilita el debugging de operaciones de filesystem.

---

## 🇬🇧 English Version (For AI Agents)

### Custom Hooks

**`useRomOperations`** (`src/renderer/hooks/useRomOperations.js`)
- Central hook for ROM operations with loading state
- Guards against double execution via `isLoading` flag
- Shows user confirmation dialogs and alert notifications
- Calls success callbacks to refresh parent component data

### Backend Services

| Service | File | Responsibility |
|---------|------|---------------|
| `configService` | `back/services/configService.js` | Persistent JSON config (paths, emulators) |
| `syncService` | `back/services/syncService.js` | PC ↔ SD card bidirectional file sync |
| `uiDataService` | `back/services/uiDataService.js` | Build console/collection objects for UI, fix cover paths |
| `backupService` | `back/services/backupService.js` | ZIP export/import of entire library |
| `editService` | `back/services/editService.js` | ROM metadata editing wrappers |

### Utility Modules

| Utility | File | Responsibility |
|---------|------|---------------|
| `getPaths` | `back/services/utils/getPaths.js` | Path resolution for ROMs, saves, covers, manuals, JSON DB |
| `getJsonUtils` | `back/services/utils/getJsonUtils.js` | CRUD operations on per-console JSON files |
| `getFilters` | `back/services/utils/getFilters.js` | ROM file extension to console system mapping |
| `getArrays` | `back/services/utils/getArrays.js` | Array helpers, system ID lists |
| `logger` | `back/services/utils/logger.js` | Prefixed logging for sync operations |

### JSON CRUD Notes

- Each console has its own JSON file: `<consoleId>.json` in the database directory
- `updateRomInJson` supports physical file renaming when `romName` or `romPath` changes
- `deleteRomFromJson` removes both the JSON entry and the physical ROM file
- `persistRomToJson` creates directories recursively as needed
