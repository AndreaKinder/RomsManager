/**
 * main.js - Proceso Principal de Electron (Multiplataforma)
 * 
 * Gestiona el ciclo de vida de la aplicación, detecta de forma nativa el sistema
 * operativo actual y configura los efectos de translucidez (Vibrancy en macOS y
 * Acrílico en Windows 11) correspondientes. Sincroniza dinámicamente el tema
 * (claro/oscuro) del sistema con el Frontend.
 */

const { app, BrowserWindow, ipcMain, nativeTheme } = require("electron");
const path = require("path");

let mainWindow = null;

function createWindow() {
  const platform = process.platform;
  const isDark = nativeTheme.shouldUseDarkColors;

  // 1. Configuración base común para todas las ventanas de la aplicación
  let windowOptions = {
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    show: false, // Se muestra solo cuando está lista para evitar el flash blanco
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  };

  // 2. Adaptación del Frame y Efectos Visuales según el Sistema Operativo
  if (platform === "darwin") {
    // macOS: Ventana frameless con botones nativos semáforo (Traffic Lights)
    windowOptions.frame = false;
    windowOptions.titleBarStyle = "hidden"; // Oculta barra pero mantiene botones integrados
    windowOptions.vibrancy = "under-window"; // Efecto traslúcido nativo del sistema
    windowOptions.transparent = true;       // Requerido para ver la transparencia del sistema
    windowOptions.visualEffectState = "active"; // Mantiene el efecto vibrante incluso desenfocada
  } 
  else if (platform === "win32") {
    // Windows 11: Ventana frameless transparente con Acrylic y TitleBarOverlay nativo
    windowOptions.frame = false;
    windowOptions.transparent = true;
    
    // Integra los botones de control nativos (Min, Max, Close) dibujados por Windows
    windowOptions.titleBarOverlay = {
      color: "#00000000", // Fondo transparente para revelar el acrílico subyacente
      symbolColor: isDark ? "#ffffff" : "#0f172a", // Color de los símbolos según tema
      height: 38 // Altura óptima que encaja con el estándar de Windows 11
    };
  } 
  else {
    // Linux: Ventana estándar sólida que obedece al gestor de ventanas del sistema (GTK/KDE)
    windowOptions.frame = true;
    windowOptions.transparent = false;
  }

  // Creación del objeto de la ventana principal
  mainWindow = new BrowserWindow(windowOptions);

  // 3. Aplicación del material Acrílico de Windows 11 (si la plataforma lo soporta)
  if (platform === "win32") {
    try {
      mainWindow.setBackgroundMaterial("acrylic");
    } catch (err) {
      console.warn("El material acrílico no es compatible con esta versión de Windows/Hardware:", err);
    }
  }

  // Carga el archivo HTML del proceso de renderizado
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Muestra la ventana de forma fluida una vez cargados los recursos
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("window-maximized", true);
  });

  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("window-maximized", false);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// 4. Canal IPC para sincronizar el sistema operativo y el tema inicial con el Frontend
ipcMain.handle("get-os-info", () => {
  return {
    os: process.platform === "darwin" ? "macos" : process.platform === "win32" ? "windows" : "linux",
    isDark: nativeTheme.shouldUseDarkColors
  };
});

// 5. Ciclo de vida y eventos del sistema operativo
app.whenReady().then(() => {
  createWindow();

  // Escucha activa de actualizaciones del tema nativo del sistema
  nativeTheme.on("updated", () => {
    const isDarkTheme = nativeTheme.shouldUseDarkColors;
    
    // En Windows actualiza dinámicamente los colores de los botones nativos del TitleBarOverlay
    if (process.platform === "win32" && mainWindow) {
      mainWindow.setTitleBarOverlay({
        color: "#00000000",
        symbolColor: isDarkTheme ? "#ffffff" : "#0f172a"
      });
    }

    // Notifica de forma asíncrona al Frontend para adaptar las clases de estilos
    mainWindow?.webContents.send("system-theme-changed", {
      isDark: isDarkTheme
    });
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
