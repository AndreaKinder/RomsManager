export const CONFIRMATION_MESSAGES = {
  IMPORT_FROM_SD: (sdPath) =>
    `¿Desea importar las ROMs desde la SD (${sdPath}) al PC?`,
  EXPORT_TO_SD: (sdPath) =>
    `¿Desea exportar todas las ROMs del PC a la SD (${sdPath})?`,
  DELETE_ROM: (romTitle) =>
    `¿Estás seguro de que quieres eliminar "${romTitle}"?\n\nEsto eliminará:\n- El archivo ROM\n- La entrada del JSON\n\nEsta acción no se puede deshacer.`,
};

export const SUCCESS_MESSAGES = {
  IMPORT_FROM_SD: "¡ROMs importadas exitosamente desde la SD!",
  EXPORT_TO_SD: "¡ROMs exportadas exitosamente a la SD!",
  ADD_ROM: (romName, system) =>
    `¡ROM "${romName}" añadida exitosamente al sistema ${system.toUpperCase()}!`,
  DELETE_ROM: (romTitle) => `ROM "${romTitle}" eliminada correctamente`,
  UPDATE_ROM: "ROM actualizada correctamente",
};

export const ERROR_MESSAGES = {
  IMPORT_ROMS: (error) => `Error al importar ROMs: ${error}`,
  EXPORT_ROMS: (error) => `Error al exportar ROMs: ${error}`,
  ADD_ROM: (error) => `Error al añadir ROM: ${error}`,
  DELETE_ROM: (error) => `Error al eliminar ROM: ${error}`,
  UPDATE_ROM: (error) => `Error al actualizar ROM: ${error}`,
  LOAD_CONSOLES: (error) => `Error al cargar las consolas: ${error}`,
  SELECT_FILE: (error) => `Error al seleccionar archivo: ${error}`,
  UNKNOWN_ERROR: "Error desconocido",
  CONNECTION_ERROR: (error) => `Error de conexión: ${error}`,
};

export const VALIDATION_MESSAGES = {
  EMPTY_TITLE: "El título no puede estar vacío",
  SELECT_CONSOLE: "Por favor selecciona una consola",
  SELECT_ROM_FILE: "Por favor selecciona un archivo ROM",
  MAX_TITLE_LENGTH: (max) => `El título no puede exceder ${max} caracteres`,
};

export const UI_TEXT = {
  APP_TITLE: "🎮 Gestor de ROMs",
  SG_PATH_LABEL: "Ruta a la Disco para Copias de Seguridad:",
  SG_PATH_PLACEHOLDER: "D:/",
  SEARCH_LABEL: "🔍",
  SEARCH_PLACEHOLDER: "Buscar por título...",
  CLEAR_SEARCH: "Limpiar búsqueda",
  NO_SEARCH_RESULTS: "No se encontraron juegos que coincidan con tu búsqueda",
  LOADING: "Cargando...",
  NO_COLLECTIONS_TITLE: "¡No se encontraron colecciones de ROMs!",
  NO_COLLECTIONS_MESSAGE:
    'Haz clic en "Importar desde la SD" para importar tus ROMs desde la tarjeta SD.',
  TOTAL_CONSOLES: "Total de Consolas:",
  TOTAL_COLLECTIONS: "Total de Colecciones:",
  TOTAL_ROMS: "Total de ROMs:",
};

export const BUTTON_LABELS = {
  ADD_ROM: "Añadir ROM",
  REFRESH: "Actualizar",
  SETTINGS: "Configuración",
  SYNC_DATA: "Copia de Seguridad",
  CANCEL: "Cancelar",
  CONFIRM: "Confirmar",
  CLOSE: "Cerrar",
  SAVE: "Guardar",
  DELETE: "Eliminar",
  CUSTOM_COLLECTION_SELECTED: "Colecciónes Personalizadas",
  SYSTEM_COLLECTION_SELECTED: "Consolas",
};

export const DEFAULT_SD_PATH = "";
export const MAX_TITLE_LENGTH = 100;
