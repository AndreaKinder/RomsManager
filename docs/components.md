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
- Título
- Nombre de archivo
- Carátula (seleccionar imagen del PC)
- Partida guardada (importar save file)
- Manual PDF (seleccionar PDF)
- Colecciones personalizadas (agregar/remover tags)

Actualiza el JSON correspondiente via IPC y refresca la lista padre.

---

## `SettingsModal`

**Ubicación**: `src/renderer/components/layout/SettingsModal.jsx`
**Tipo**: Modal con estado local

Configuración global de la aplicación:
- **Ruta base de ROMs**: Cambiar el directorio raíz donde se almacenan ROMs, saves, covers, manuals.
- **Emuladores por consola**: Asignar un ejecutable de emulador a cada consola soportada. Usa un selector de archivo nativo.
- **Backup/Restore**: Exportar toda la biblioteca a un ZIP o restaurar desde uno.

Los emuladores se guardan en `config.json` bajo la clave `emulators`.

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
**Tipo**: Modal (wizard)

Aparece la primera vez que se ejecuta la app. Guía al usuario para:
1. Seleccionar el directorio base donde se almacenarán las ROMs.
2. Confirmar la configuración.

Una vez completado, guarda la ruta en `config.json` y carga las consolas.

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
| `EditRomModal` | `roms/EditRomModal.jsx` | Modal | Edit ROM metadata, cover, save, manual, collections |
| `SettingsModal` | `layout/SettingsModal.jsx` | Modal | Global settings: base path, emulators, backup |
| `BigPictureView` | `bigpicture/BigPictureView.jsx` | Fullscreen view | TV/gamepad mode with spatial navigation |
| `FirstRunModal` | `layout/FirstRunModal.jsx` | Wizard | Initial setup for ROMs base path |
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
