# Modo Big Picture

## 🇪🇸 Descripción

El **modo Big Picture** es una vista fullscreen alternativa diseñada para ser usada desde el sillón, con una interfaz optimizada para TVs de gran tamaño y control mediante **gamepad** o **teclado**. Reemplaza completamente la vista de escritorio normal cuando está activo.

## Características

- **Fullscreen automático**: Al entrar, la ventana de Electron pasa a pantalla completa. Al salir, vuelve a modo ventana.
- **Navegación espacial LRUD**: Las flechas direccionales mueven el foco visualmente a la tarjeta más cercana en esa dirección, respetando el layout de grilla.
- **Soporte de gamepad**: Compatible con cualquier controlador estándar (Xbox, PlayStation, genérico) vía Web Gamepad API.
- **Auto-ocultar cursor**: El mouse se oculta tras 3 segundos de inactividad para no distraer.
- **Lanzamiento directo**: Seleccionar una ROM inicia el emulador configurado inmediatamente.

## Cómo Activar

Desde la vista de escritorio, hacer clic en el botón **"🖥 Big Picture"** en el header. También puede activarse programáticamente via `window.electronAPI.enterBigPicture()`.

## Componente Principal

Archivo: `src/renderer/components/bigpicture/BigPictureView.jsx`

### Estado Interno

```javascript
const [focusedIdx, setFocusedIdx] = useState(0);    // Índice de la tarjeta enfocada
const [isLaunching, setIsLaunching] = useState(false); // Estado de lanzamiento
const [launchError, setLaunchError] = useState(null);  // Error actual (modal)
```

### Estructura de Datos

Las consolas y ROMs se reciben como props (`consoles`). El componente las "aplana" (`flatRoms`) en un array unidimensional que respeta el orden visual de renderizado (sección por sección, de arriba hacia abajo, izquierda a derecha).

```javascript
const flatRoms = useMemo(() => {
  const result = [];
  consoles.forEach((con) => {
    const roms = Array.isArray(con.roms) ? con.roms : Object.values(con.roms || {});
    roms.forEach((rom) => result.push({
      ...rom,
      _consoleId: rom.system || con.id || con.collectionName,
      _consoleName: con.name || con.collectionName,
    }));
  });
  return result;
}, [consoles]);
```

## Navegación con Teclado

| Tecla | Acción |
|-------|--------|
| `←` `→` `↑` `↓` | Mover foco espacialmente |
| `Enter` | Lanzar ROM enfocada |
| `Escape` | Salir del modo Big Picture |

La navegación usa un algoritmo de **búsqueda espacial** que calcula la distancia desde el centro del elemento actual al centro de todos los demás elementos en la dirección deseada. Prioriza elementos alineados perpendicularmente con un factor de penalización de 0.7.

```javascript
function getDocCenter(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 + window.scrollX,
    y: rect.top + rect.height / 2 + window.scrollY,
  };
}
```

El elemento con menor `score = primary_distance + secondary_distance * 0.7` se convierte en el nuevo foco.

## Soporte de Gamepad

### Mapeo de Botones

```javascript
const GAMEPAD_MAP = {
  0: "select",  // A / Cross
  1: "back",    // B / Circle
  9: "escape",  // Start
  12: "up",     // D-pad Up
  13: "down",   // D-pad Down
  14: "left",   // D-pad Left
  15: "right",  // D-pad Right
};
```

### Polling Loop

El gamepad se consulta en un loop de `requestAnimationFrame` a ~60fps:

```javascript
useEffect(() => {
  let rafId;
  const poll = (timestamp) => {
    const gamepads = navigator.getGamepads();
    // ... lógica de detección de botones ...
    rafId = requestAnimationFrame(poll);
  };
  rafId = requestAnimationFrame(poll);
  return () => cancelAnimationFrame(rafId);
}, []);
```

### Lógica de Detección

Cada botón tiene un estado interno (`wasPressed`, `ts`):

1. **Rising edge** (flanco ascendente): Cuando `pressed` pasa de `false` a `true`. Ejecuta la acción una sola vez.
2. **Hold repeat** (repetición al mantener): Si el botón sigue presionado y han pasado más de `GAMEPAD_REPEAT_MS` (180ms) desde la última acción, se repite. Solo aplica a direcciones (up/down/left/right), no a select/back.
3. **Release** (suelta): Cuando `pressed` vuelve a `false`, resetea el estado.

### Deduplicación por Frame

Si múltiples gamepads están conectados y presionan el mismo botón en el mismo frame, solo se ejecuta la acción una vez gracias a un `Set` de `actionsThisFrame`.

### Manejo de Errores

Si una ROM se selecciona pero no hay emulador configurado para esa consola, aparece un modal centrado que bloquea toda entrada hasta que el usuario pulse `Enter`, `Escape`, `A` o `B` para descartarlo.

```javascript
if (launchError) {
  if (action === "select" || action === "back" || action === "escape") {
    setLaunchError(null);
  }
  continue;
}
```

## Estilos Específicos

Archivo: `src/styles/bigpicture.css`

| Clase | Descripción |
|-------|-------------|
| `.bp-container` | Contenedor fullscreen fixed con fondo `#0d0d0d` |
| `.bp-header` | Barra superior fija con logo y botón Exit |
| `.bp-scroll-area` | Área scrollable con padding generoso |
| `.bp-section` | Agrupación por consola/colección |
| `.bp-section-title` | Título de sección con icono y contador |
| `.bp-grid` | Grilla CSS responsive (`auto-fill`, `minmax(160px, 1fr)`) |
| `.bp-card` | Tarjeta de ROM con aspect-ratio 3/4 |
| `.bp-card.focused` | Estado enfocado: escala 1.08, borde blanco, doble sombra |
| `.bp-card-cover` | Imagen de carátula con `background-size: cover` |
| `.bp-card-no-cover` | Placeholder con patrón de puntos y icono 🎮 |
| `.bp-card-title` | Título truncado con ellipsis, fondo negro |

### Estados de Tarjeta

- **Normal**: Borde transparente, sin transformación.
- **Hover** (mouse): `scale(1.04)`, borde semitransparente, sombra dura.
- **Focused** (teclado/gamepad): `scale(1.08)`, borde blanco sólido, doble sombra (`0 0 0 4px #fff, 8px 8px 0px #000`), título con fondo púrpura `#8b5cf6`.

## Consideraciones de UX

- **Scroll automático**: Cuando el foco cambia, la tarjeta enfocada se desplaza automáticamente a la vista con `scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" })`.
- **Cursor oculto**: Se usa `document.addEventListener("mousemove", resetCursorTimer)` para mostrar el cursor al mover el mouse y ocultarlo tras 3 segundos.
- **TabIndex negativo**: Los botones interactivos usan `tabIndex={-1}` para evitar que el navegador nativo interfiera con la navegación controlada por el componente.
- **Clamp de índice**: Si las consolas se filtran y el número total de ROMs disminuye, `focusedIdx` se ajusta automáticamente para no quedar fuera de rango.

---

## 🇬🇧 English Version (For AI Agents)

### Big Picture Mode Overview

BigPictureView is a fullscreen alternative view optimized for TV/gamepad usage. It replaces the normal desktop view when active.

### Entry/Exit

- Entry: `window.electronAPI.enterBigPicture()` → main process calls `mainWindow.setFullScreen(true)`
- Exit: `window.electronAPI.exitBigPicture()` → main process calls `mainWindow.setFullScreen(false)`

### Spatial Navigation Algorithm

1. Get document-center coordinates of currently focused card via `getBoundingClientRect()`
2. Iterate all cards, filter out those not in the desired direction (dx/dy threshold of 5px)
3. Score each candidate: `score = primary_distance + perpendicular_distance * 0.7`
4. Select candidate with lowest score

### Gamepad Implementation

- Uses `navigator.getGamepads()` polled inside `requestAnimationFrame`
- Tracks button state per gamepad index: `{ wasPressed: boolean, ts: number }`
- Supports rising-edge detection, hold-repeat (180ms interval), and release
- Dedupes actions per frame across multiple gamepads via `Set`
- Only directional buttons repeat on hold; action buttons (select/back/escape) do not

### Styling Key Points

- Zero border-radius everywhere
- Cards use `aspect-ratio: 3 / 4`
- Focused state: white border + hard shadow + purple title background
- Scrollbar custom: 6px width, semi-transparent thumb
- Responsive grid: `repeat(auto-fill, minmax(160px, 1fr))`
