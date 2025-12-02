export const CONFIRMATION_MESSAGES = {
  IMPORT_FROM_SD: (sdPath) =>
    `¿Desea importar las ROMs desde la SD (${sdPath}) al PC?`,
  EXPORT_TO_SD: (sdPath) =>
    `¿Desea exportar todas las ROMs del PC a la SD (${sdPath})?`,
};

export const SUCCESS_MESSAGES = {
  IMPORT_FROM_SD: "ROMs importadas exitosamente desde SD!",
  EXPORT_TO_SD: "ROMs exportadas exitosamente a la SD!",
  ADD_ROM: (romName, system) =>
    `ROM "${romName}" añadida exitosamente al sistema ${system.toUpperCase()}!`,
};

export const ERROR_MESSAGES = {
  IMPORT_ROMS: (error) => `Error al importar ROMs: ${error}`,
  EXPORT_ROMS: (error) => `Error al exportar ROMs: ${error}`,
  ADD_ROM: (error) => `Error al añadir ROM: ${error}`,
  UNKNOWN_ERROR: "Error desconocido",
};

export const UI_TEXT = {
  APP_TITLE: "🎮 ROM Manager",
  SD_PATH_LABEL: "Galic SD Path:",
  SD_PATH_PLACEHOLDER: "D:/",
  LOADING: "Loading...",
  NO_COLLECTIONS_TITLE: "No ROM collections found!",
  NO_COLLECTIONS_MESSAGE: 'Click "Sync ROMs" to import your ROMs from SD card.',
  TOTAL_CONSOLES: "Total Consoles:",
  TOTAL_ROMS: "Total ROMs:",
};

export const BUTTON_LABELS = {
  ADD_ROM: "➕ Add ROM",
  IMPORT_FROM_SD: "📥 Import from Galic SD",
  EXPORT_TO_SD: "📤 Export to Galic SD",
  REFRESH: "🔄️ Refresh",
};

export const DEFAULT_SD_PATH = "D:/";
