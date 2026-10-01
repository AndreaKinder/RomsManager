# 🎮 ROM Manager

Una aplicación de escritorio moderna y retro para organizar, sincronizar y disfrutar de colecciones de ROMs en múltiples consolas retro.

![ROM Manager](./screenshots/app-screenshot.png)

![Version](https://img.shields.io/badge/version-0.6.0-purple)
![Electron](https://img.shields.io/badge/Electron-44-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🌟 Características Principales

### 🕹️ Gestión y Organización de ROMs
- **Soporte Multi-Consola**: Compatible con más de 18 sistemas (NES, SNES, Genesis, Game Boy, GBA, N64, NDS, 3DS, PS1, PS2, PSP, GameCube, Wii, Switch, Neo Geo, etc.).
- **Detección Automática**: Identificación inteligente de sistemas a partir de extensiones y cabeceras de archivos.
- **Colecciones Personalizadas**: Agrupa juegos por etiquetas y colecciones transversales entre sistemas.
- **Búsqueda en Tiempo Real**: Filtrado instantáneo por título y nombre de archivo.
- **Gestión de Partidas y Manuales**: Vinculación de archivos de guardado (`.sav`, `.srm`, `.state`) y visualizador integrado de manuales en PDF.

### 📺 Big Picture Mode (Modo TV y Gamepad)
- **Navegación con Mandos**: Soporte nativo para gamepads mediante Web Gamepad API con detección de flanco y repetición suave.
- **Navegación Espacial**: Movimiento direccional fluido optimizado para pantallas grandes y televisores.
- **Atajos de Teclado**: Soporte completo para flechas, Intro y Escape.
- **Ocultamiento de Cursor**: El puntero se oculta automáticamente tras 3 segundos de inactividad.

### 💾 Almacenamiento Flexible y Portabilidad
- **Almacenamiento Interno o Externo**: Configura tu biblioteca en el disco local o directamente en tarjetas SD / discos externos.
- **Base de Datos Portátil**: En modo externo, la base de datos se guarda en la propia unidad, permitiendo llevar tu biblioteca a cualquier equipo sin perder configuración.

### 🔄 Sincronización Avanzada
- **Sincronización con Tarjeta SD**: Importación y exportación bidireccional entre el PC y dispositivos portátiles.
- **EmulationStation / ES-DE / Batocera / RetroPie**: Generación y actualización automática de archivos `gamelist.xml` y carátulas vinculadas.
- **Sincronización Android vía ADB**: Conexión inalámbrica (Wi-Fi) o por cable USB con consolas Android (Retroid Pocket, AYN Odin, Anbernic, etc.). Comparación de ROMs existentes, descarga automática de ADB y transferencia con barra de progreso.

### 🌐 Scraping de Metadatos
- **ScreenScraper y TheGamesDB**: Descarga automática de carátulas, títulos oficiales, descripciones, desarrolladores y fechas de lanzamiento.

### 🚀 Lanzamiento Directo y Respaldo
- **Lanzador de Emuladores**: Asigna emuladores por consola y ejecuta tus juegos directamente desde la interfaz.
- **Copia de Seguridad y Restauración**: Exporta e importa copias completas en ZIP de tu biblioteca, partidas y metadatos.

---

## 💻 Requisitos e Instalación

### Requisitos Previos
- **Node.js**: v18 o superior
- **npm** o gestor de paquetes compatible

### Clonar e Instalar

```bash
git clone https://github.com/andreakinder/RomsManager.git
cd RomsManager
npm install
```

### Ejecutar en Desarrollo

```bash
npm start
```

### Compilar y Empaquetar

```bash
# Compilar paquete para tu plataforma actual
npm run package

# Generar instaladores e imágenes distribuibles (AppImage, deb, exe, zip)
npm run make

# Verificar configuración de build
npm run verify-build
```

### Pruebas

```bash
npm test
npm run test:watch
npm run test:coverage
```

---

## 🎮 Modos de Navegación y Uso

### 1. Asistente Inicial (First-Run Wizard)
Al iniciar por primera vez, el asistente te permite:
1. Elegir entre almacenamiento **Interno** (disco local) o **Externo** (tarjeta SD / disco USB portátil).
2. Seleccionar el directorio base de tus ROMs.
3. Activar o desactivar la sincronización automática con EmulationStation (`gamelist.xml`).

### 2. Modo Escritorio
- **Añadir ROMs**: Usa el botón superior para agregar ROMs individuales seleccionando la consola destino.
- **Scraper**: Abre la edición de cualquier ROM y busca metadatos en ScreenScraper o TheGamesDB con un clic.
- **Manuales y Saves**: Asocia manuales PDF y partidas guardadas directamente desde el modal de edición.
- **Lanzar Juego**: Si tienes configurado el ejecutable del emulador en Ajustes, haz clic en Jugar para lanzar el emulador con la ROM.

### 3. Modo Big Picture
- Actívalo pulsando el botón **Big Picture** en la barra superior o mediante atajo.
- Diseñado para usarse con mando desde el sofá: navega por cuadrículas de carátulas, selecciona juegos, lee sinopsis y lanza partidas.

### 4. Sincronización con Consolas Android (ADB)
- En Ajustes > Sincronización ADB, conecta tu dispositivo por USB o mediante IP y puerto inalámbrico.
- La aplicación puede descargar automáticamente las herramientas ADB (`platform-tools`) si no están en tu sistema.
- Compara tu biblioteca local con la del dispositivo Android e inicia la sincronización de ROMs seleccionadas.

---

## 📁 Estructura del Almacenamiento

### Estructura de Carpetas en Disco

```
<RomsBasePath>/
├── Roms/
│   ├── nes/
│   │   ├── SuperMarioBros.nes
│   │   └── gamelist.xml       # Si la sincronización ES está activa
│   ├── snes/
│   ├── gba/
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
└── database/                 # Presente en modo almacenamiento externo
    ├── nes.json
    └── ...
```

---

## 🗂️ Consolas Soportadas

| Consola | Identificador | Extensiones Principales |
|---------|---------------|-------------------------|
| NES / Famicom | `nes` | `.nes` |
| Super Nintendo | `sfc` | `.smc`, `.sfc` |
| Sega Genesis / Mega Drive | `genesis` | `.md`, `.gen`, `.sms` |
| Sega CD | `sega_cd` | `.ccd`, `.cue`, `.iso` |
| Game Boy | `gb` | `.gb` |
| Game Boy Color | `gbc` | `.gbc` |
| Game Boy Advance | `gba` | `.gba` |
| Nintendo 64 | `n64` | `.z64`, `.v64`, `.n64` |
| Nintendo DS | `nds` | `.nds` |
| Nintendo 3DS | `3ds` | `.3ds`, `.cia` |
| GameCube | `gc` | `.gcm`, `.iso`, `.gcz` |
| Wii | `wii` | `.iso`, `.wbfs`, `.wad` |
| Wii U | `wiiu` | `.wud`, `.wux`, `.rpx` |
| Nintendo Switch | `switch` | `.nsp`, `.xci`, `.nca`, `.nro` |
| PlayStation 1 | `ps` | `.pbp`, `.bin`, `.cue`, `.iso` |
| PlayStation 2 | `ps2` | `.bin`, `.cue`, `.iso` |
| PlayStation Portable | `psp` | `.iso`, `.cso`, `.psp` |
| Neo Geo | `neogeo` | `.zip` |

---

## 🛠️ Stack Tecnológico

- **Entorno Desktop**: [Electron 44](https://www.electronjs.org/) + [Electron Forge](https://www.electronforge.io/)
- **Frontend**: [React 19](https://react.dev/)
- **Iconografía**: [Tabler Icons React](https://tabler.io/icons)
- **Estilos**: Retro Dark Cyberpunk + [nes.css](https://nostalgic-css.github.io/NES.css/) + Fuentes Pixel Art (Press Start 2P)
- **Empaquetado**: Webpack 5
- **Conectividad & Scraping**: Axios, xml2js, Adm-Zip, ADB Tools

---

## 📚 Documentación Detallada

Para más información técnica consulta los documentos en [`docs/`](docs/):
- [Arquitectura del Sistema](docs/architecture.md)
- [Modo Big Picture y Soporte de Gamepad](docs/big-picture-mode.md)
- [Componentes de React](docs/components.md)
- [Hooks y Servicios Backend](docs/hooks-and-utils.md)
- [Guía de Diseño Retro](docs/retro-design.md)
- [Convenciones de Código](docs/conventions.md)
- [Estándar de Commits](docs/standard-commits.md)

---

## 📄 Licencia

Este proyecto está bajo licencia [MIT](LICENSE).
