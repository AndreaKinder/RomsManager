# Decisiones de Diseño Retro

## 🇪🇸 Filosofía Visual

ROM Manager adopta una estética **retro / pixel-art / 8-bit** que evoca interfaces de videoconsolas clásicas y computadoras personales de los años 80 y 90. El objetivo no es simplemente "verse antiguo", sino crear una experiencia cohesiva que resuene con la naturaleza del contenido: ROMs de juegos retro.

## Principios Fundamentales

### 1. Cero Border-Radius

TODOS los elementos de la interfaz usan `border-radius: 0`. Esto incluye botones, inputs, modales, tarjetas, tags, y scrollbars. Las esquinas rectas evocan sprites de juegos 2D y interfaces de sistemas como NES o DOS.

```css
.btn, .rom-card, .modal-content, .form-field input {
  border-radius: 0;
}
```

### 2. Sombras Duras (Hard Shadows)

En lugar de sombras difusas modernas (`box-shadow` con blur), se usan sombras duras y desplazadas que imitan el estilo visual de los juegos de 8-bits:

```css
.btn:hover:not(:disabled) {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px #000;
}

.rom-card:hover {
  transform: translate(-4px, -4px);
  box-shadow: 6px 6px 0px #000;
}
```

En el modo Big Picture, las tarjetas enfocadas usan una doble sombra para un efecto de "pop" más intenso:

```css
.bp-card.focused {
  box-shadow: 0 0 0 4px #fff, 8px 8px 0px #000;
}
```

### 3. Transiciones Deshabilitadas

Para mantener una sensación de respuesta **instantánea** tipo arcade, casi todos los elementos usan `transition: none`. No hay fades suaves ni animaciones de entrada/salida. Todo cambio es inmediato.

```css
.btn, .rom-card, .rom-icon-btn {
  transition: none;
}
```

**Excepciones controladas**:
- Hover sobre `.clear-search` permite una transformación de escala mínima.
- El cursor del mouse en Big Picture mode usa `setTimeout` de 3s para ocultarse.

### 4. Tipografía Pixel-Art

La fuente principal de títulos es **Press Start 2P**, una tipografía gratuita de Google Fonts que emula los textos de juegos retro.

```css
@font-face {
  font-family: "Press Start 2P";
  src: url("../renderer/assets/fonts/PressStart2P-Regular.ttf")
    format("truetype");
}

h1, h2, h3, h4, h5, h6 {
  font-family: "Press Start 2P", monospace;
  text-transform: uppercase;
}
```

El cuerpo del texto usa **Courier New** (monospace) para mantener la estética de terminal/consola.

### 5. Paleta de Colores Oscura y Saturada

```css
:root {
  --primary-color: #8b5cf6;   /* Púrpura/Indigo - acento principal */
  --success-color: #92cc41;   /* Verde retro */
  --warning-color: #f6d365;   /* Amarillo */
  --danger-color: #e52521;    /* Rojo Nintendo */
  --background: #121212;      /* Fondo casi negro */
  --surface: #212121;         /* Superficie de tarjetas */
  --surface-light: #333333;   /* Elementos secundarios */
  --text-primary: #ffffff;
  --text-secondary: #bbbbbb;
  --border-color: #555555;
  --hover-bg: #3a3a3a;
}
```

La paleta busca:
- **Bajo contraste de fondo** para no fatigar la vista en sesiones largas.
- **Colores planos y saturados** para elementos interactivos (botones, indicadores).
- **Blanco puro solo para texto principal** y estados enfocados.

### 6. Efecto de Scanlines

El fondo global tiene un patrón de líneas horizontales sutiles que simulan el efecto de scanlines de monitores CRT:

```css
body {
  background-image: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 2px,
    transparent 2px,
    transparent 4px
  );
}
```

### 7. Iconografía de Disquete

Las tarjetas de ROM sin carátula muestran un icono SVG de **disquete** (floppy disk) como placeholder, reforzando la estética vintage. Las tarjetas con carátula usan una imagen de fondo con un overlay oscuro que se intensifica en hover para mostrar los controles.

### 8. Scrollbars Personalizadas

Los scrollbars siguen la estética general: sin border-radius, colores planos, y thumb semi-transparente.

```css
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-track {
  background: var(--surface);
}
::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 0;
}
```

### 9. Modales con Sombra Dura

```css
.modal-content {
  border-radius: 0;
  border: 2px solid var(--border-color);
  box-shadow: 8px 8px 0px #000;
}
```

## Uso de nes.css

El proyecto incluye `nes.css` como dependencia, pero el CSS principal es **custom**. nes.css se usa como referencia de estilo y para componentes específicos si es necesario, pero la mayoría de la UI está construida con clases propias que ofrecen mayor control sobre la estética oscura y las sombras duras.

## UX Considerations

- **Legibilidad**: El overlay oscuro sobre carátulas garantiza que el texto blanco sea legible incluso sobre imágenes claras.
- **Indicadores de estado**: Los indicadores de partida guardada (💾) y manual (📖) aparecen solo en hover para no saturar la tarjeta.
- **Acciones contextuales**: Los botones de acción (play, edit, delete, export) se revelan en hover con opacidad animada instantáneamente.
- **Responsive**: La grilla de ROMs usa `repeat(auto-fill, minmax(320px, 1fr))` en desktop y `repeat(auto-fill, minmax(160px, 1fr))` en Big Picture.

---

## 🇬🇧 English Version (For AI Agents)

### Retro Design Philosophy

ROM Manager uses a retro/pixel-art aesthetic to match its content (retro game ROMs). Key design decisions:

1. **Zero border-radius** — All elements have sharp corners (`border-radius: 0`)
2. **Hard shadows** — `box-shadow: 4px 4px 0px #000` instead of soft blurred shadows
3. **No CSS transitions** — Instant feedback (`transition: none`) for an arcade-like feel
4. **Pixel font** — Press Start 2P for headings, Courier New for body
5. **Dark saturated palette** — #121212 background, #8b5cf6 primary accent
6. **Scanline background** — Subtle horizontal line pattern via `repeating-linear-gradient`
7. **Floppy disk placeholder** — SVG icon for ROMs without cover art
8. **Custom scrollbars** — Flat, no border-radius, semi-transparent thumb
9. **Hard-shadow modals** — `box-shadow: 8px 8px 0px #000` on modal content

### CSS Variables

All colors are centralized in `:root` CSS custom properties. No hardcoded colors should be used in components; always reference the variables.

### Framework Usage

`nes.css` is included as a dependency but the primary styling is custom CSS in `src/styles/index.css` and `src/styles/bigpicture.css`. The custom CSS provides finer control over the dark theme and hard-shadow aesthetic that nes.css's default light theme does not match.
