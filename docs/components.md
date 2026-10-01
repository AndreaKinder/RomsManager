# Componentes Clave

## 🇪🇸 Visión General

La interfaz de ROM Manager está construida con componentes React funcionales siguiendo una arquitectura de **componentes presentacionales** con estado local mínimo. La lógica de negocio y el estado global residen en `App.jsx` y los custom hooks.

---

## `App.jsx`

**Ubicación**: `src/renderer/App.jsx`
**Tipo**: Componente raíz (container)

Responsabilidades:
- Estado global de la aplicación (consolas, colecciones, búsqueda, modales, modo Big Picture)
- Flujo de inicialización (first-run, path validation)
- Filtrado de consolas y ROMs por término de búsqueda
- Coordinación de callbacks entre header, lista, y modales

### Estados Principales

| Estado | Descripción |
|--------|-------------|
| `consoles` | Array de consolas con sus ROMs (desde `uiDataService`) |
| `customCollections` | Array de colecciones personalizadas extraídas del campo `collections` |
| `isCustomCollectionView` | Toggle entre vista por consola y vista por colección |
| `searchQuery` | Término de búsqueda actual |
| `isBigPictureMode` | Activa/desactiva la vista `BigPictureView` |
| `showFirstRunModal` | Muestra el wizard de primera ejecución |
| `showPathMissingModal` | Muestra alerta si el path configurado ya no existe |

### Flujo de Carga de Colecciones

Las colecciones personalizadas se generan en el cliente iterando sobre todas las ROMs y agrupando por el campo `collections` (array de strings). Esto permite una organización transversal independiente de la consola.

---

## `AppHeader`

**Ubicación**: `src/renderer/components/layout/AppHeader.jsx`
**Tipo**: Presentacional

Renderiza:
- Título de la app (`🎮 Gestor de ROMs`)
- Campo de búsqueda con botón de limpiar
- Botones de acción:
  - **Añadir ROM** — Abre `SelectConsoleModal`
  - **Configuración** — Abre `SettingsModal`
  - **Big Picture** — Activa el modo fullscreen
  - **Colecciones/Consolas** — Toggle entre vistas

Todos los textos provienen de `src/renderer/constants/messages.js`.

---

## `ConsoleList` y `ConsoleCollection`

**Ubicación**: `src/renderer/components/layout/ConsoleList.jsx`, `src/renderer/components/roms/ConsoleCollection.jsx`
**Tipo**: Presentacional

`ConsoleList` recibe un array de consolas (o colecciones) y renderiza una `ConsoleCollection` por cada una.

`ConsoleCollection`:
- Header colapsable con nombre de consola, icono, y contador de ROMs
- Grilla de `RomCard` dentro

Soporta el flag `isCustomCollection` para diferenciar visualmente colecciones personalizadas de consolas reales.

---

## `RomCard`

**Ubicación**: `src/renderer/components/roms/RomCard.jsx`
**Tipo**: Presentacional con estado local

La unidad visual principal de la aplicación. Cada tarjeta representa una ROM.

### Estructura Visual

```
┌─────────────────────────────┐
│  [Cover Image o Disquete]   │  ← Background layer
│                             │
│  ┌─────────────────────┐    │
│  │  💾  📖 (indicators)│    │  ← Bottom-left, visible en hover
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │  ▶  🗑  ✏  ⬇        │    │  ← Bottom-right action icons
│  └─────────────────────┘    │
│                             │
│  [Título]                   │  ← Visible en hover con overlay oscuro
└─────────────────────────────┘
```

### Acciones

| Icono | Acción | Handler |
|-------|--------|---------|
| ▶ | Lanzar ROM | `handleLaunchClick` |
| 🗑 | Eliminar ROM | `handleDeleteClick` |
| ✏ | Editar ROM | `handleEditClick` |
| ⬇ | Exportar ROM | `handleExportClick` |
| 💾 | Exportar partida | `handleExportSaveClick` |
| 📖 | Ver manual | `handleViewManualClick` |

### Carátulas

Las carátulas se cargan via el protocolo `media://`:

```javascript
const getCoverUrl = (coverPath) => {
  if (!coverPath) return null;
  const encodedPath = coverPath.split("/").map(encodeURIComponent).join("/");
  return `media://${encodedPath}`;
};
```

El path se codifica por segmentos (no por slashes completos) para evitar problemas con rutas anidadas.

---

## `EditRomModal`

**Ubicación**: `src/renderer/components/roms/EditRomModal.jsx`
**Tipo**: Modal con estado local

Permite editar los metadatos de una ROM:
- **Scraping Integrado**: Botón para consultar ScreenScraper o TheGamesDB y autocompletar título, sinopsis, año, desarrollador y carátula.
- Título y nombre de archivo.
- Carátula (seleccionar imagen local o desde el scraper).
- Partida guardada (importar archivo de guardado).
- Manual PDF (seleccionar archivo PDF).
- Colecciones personalizadas (añadir/eliminar etiquetas).

Actualiza el JSON correspondiente y, si está activa la sincronización con EmulationStation, actualiza el `gamelist.xml`.

---

## `SettingsModal`

**Ubicación**: `src/renderer/components/layout/SettingsModal.jsx`
**Tipo**: Modal con estado local y pestañas/secciones

Configuración global de la aplicación:
- **Almacenamiento**: Selección entre Almacenamiento Interno (disco local) o Almacenamiento Externo (tarjeta SD / USB portátil con base de datos autónoma).
- **Sincronización EmulationStation**: Switch para sincronización automática y botón para sincronizar todos los `gamelist.xml` bajo demanda.
- **Sincronización ADB Android**: Configuración de binario ADB, conexión inalámbrica por IP/puerto, detección de consolas Android y explorador/comparador de ROMs.
- **Scraper**: Configuración del proveedor preferido (ScreenScraper / TheGamesDB) e introducción de credenciales/API keys.
- **Emuladores por consola**: Asignar un ejecutable de emulador a cada consola soportada con selector nativo.
- **Copia de Seguridad y Restauración**: Exportar toda la biblioteca a un ZIP o restaurar desde un archivo ZIP.

---

## `BigPictureView`

**Ubicación**: `src/renderer/components/bigpicture/BigPictureView.jsx`
**Tipo**: Vista fullscreen compleja

Documentado extensivamente en [`docs/big-picture-mode.md`](big-picture-mode.md).

Resumen de responsabilidades:
- Renderizar todas las ROMs en una grilla scrollable agrupadas por consola/colección
- Navegación espacial LRUD con teclado y gamepad
- Lanzamiento directo de ROMs
- Auto-ocultar cursor
- Manejo de errores (emulador no configurado)

---

## `FirstRunModal`

**Ubicación**: `src/renderer/components/layout/FirstRunModal.jsx`
**Tipo**: Modal (wizard de configuración inicial)

Aparece la primera vez que se ejecuta la app o si se reconfigura el almacenamiento:
1. **Tipo de almacenamiento**: Tarjetas interactivas para elegir entre almacenamiento Interno (PC) o Externo (tarjeta SD / disco USB con base de datos portátil).
2. **Directorio base**: Selector para definir la carpeta raíz donde se crearán las subcarpetas de ROMs.
3. **EmulationStation Sync**: Opción para habilitar la generación automática de archivos `gamelist.xml` y carátulas para frontends compatibles.

---

## `PathMissingModal`

**Ubicación**: `src/renderer/components/layout/PathMissingModal.jsx`
**Tipo**: Modal de alerta

Aparece si el directorio base configurado ya no existe (ej: unidad externa desconectada). Ofrece:
- Cerrar la aplicación
- Reconfigurar la ruta (vuelve a `FirstRunModal`)

---

## `ManualViewerModal`

**Ubicación**: `src/renderer/components/roms/ManualViewerModal.jsx`
**Tipo**: Modal

Muestra un PDF incrustado via `<iframe>` con el manual de la ROM. Usa el protocolo `media://` para cargar el archivo PDF local.

---

## `LoadingState` y `EmptyState`

**Ubicación**: `src/renderer/components/layout/LoadingState.jsx`, `src/renderer/components/layout/EmptyState.jsx`
**Tipo**: Presentacionales puros

Estados de carga y vacío mostrados condicionalmente en `AppContent`.

---

## 🇬🇧 English Version (For AI Agents)

### Component Architecture

ROM Manager uses functional React components with minimal local state. Business logic lives in `App.jsx` and custom hooks.

### Key Components

| Component | Location | Type | Responsibility |
|-----------|----------|------|----------------|
| `App` | `renderer/App.jsx` | Container | Global state, initialization, filtering, view coordination |
| `AppHeader` | `layout/AppHeader.jsx` | Presentational | Title, search, action buttons |
| `ConsoleList` | `layout/ConsoleList.jsx` | Presentational | Renders ConsoleCollection list |
| `ConsoleCollection` | `roms/ConsoleCollection.jsx` | Presentational | Collapsible console section with RomCards |
| `RomCard` | `roms/RomCard.jsx` | Presentational + local state | ROM display card with cover, actions, indicators |
| `EditRomModal` | `roms/EditRomModal.jsx` | Modal | Edit ROM metadata, scraper search, cover, save, manual, collections |
| `SettingsModal` | `layout/SettingsModal.jsx` | Modal | Global settings: storage type, ES sync, ADB sync, scraper credentials, emulators, backup |
| `BigPictureView` | `bigpicture/BigPictureView.jsx` | Fullscreen view | TV/gamepad mode with spatial navigation |
| `FirstRunModal` | `layout/FirstRunModal.jsx` | Wizard | Initial setup for storage mode (internal/external), base path, and ES sync |
| `PathMissingModal` | `layout/PathMissingModal.jsx` | Alert | Warns when configured path is missing |
| `ManualViewerModal` | `roms/ManualViewerModal.jsx` | Modal | PDF viewer for game manuals |


### RomCard Actions

- Play (launch emulator)
- Delete (with confirmation)
- Edit (opens EditRomModal)
- Export (save dialog)
- Export Save (if savePath exists)
- View Manual (if manualPath exists)

### Cover Image Protocol

Covers are loaded via the custom `media://` protocol. The path is encoded per segment (split by `/`, encode each segment, rejoin) to preserve directory structure while escaping special characters.
