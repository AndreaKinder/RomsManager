/**
 * preload.js - Script de Precarga (Preload)
 * 
 * Actúa como un puente seguro y aislado (Context Bridge) entre el proceso 
 * principal (NodeJS/Main) y el proceso de renderizado (Frontend/Renderer).
 * Expone exclusivamente funciones seguras sin dar acceso completo a las APIs
 * de Node, previniendo vulnerabilidades críticas de seguridad.
 */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  /**
   * Obtiene la información inicial del sistema operativo y estado de tema
   * @returns {Promise<{os: string, isDark: boolean}>}
   */
  getOSInfo: () => ipcRenderer.invoke("get-os-info"),

  /**
   * Registra un callback que escucha cambios reactivos del tema del sistema (Claro/Oscuro)
   * @param {function} callback - Función a ejecutar con el nuevo estado del tema
   * @returns {function} Función de limpieza para cancelar la suscripción
   */
  onSystemThemeChanged: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on("system-theme-changed", subscription);

    // Retorna una función para desregistrar el listener de forma segura y evitar fugas de memoria
    return () => {
      ipcRenderer.removeListener("system-theme-changed", subscription);
    };
  },

  /**
   * Registra un callback que escucha cuando la ventana se maximiza o des-maximiza
   * @param {function} callback - Función a ejecutar con el estado de maximización
   * @returns {function} Función de limpieza para cancelar la suscripción
   */
  onWindowMaximized: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on("window-maximized", subscription);
    return () => {
      ipcRenderer.removeListener("window-maximized", subscription);
    };
  }
});
