const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");

module.exports = {
  packagerConfig: {
    asar: true,
    icon: "./assets/icon",
    executableName: "romsmanager",
    name: "ROM Manager",
    appBundleId: "com.andreakinder.romsmanager",
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      platforms: ["win32"],
      config: {
        name: "romsmanager",
        authors: "andreakinder",
        description: "A desktop application for managing retro game ROMs",
        iconUrl:
          "https://raw.githubusercontent.com/andreakinder/RomsManager/main/assets/icon.ico",
        setupIcon: "./assets/icon.ico",
        loadingGif: "./assets/icon.png",
        noMsi: true,
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["win32", "darwin"],
      config: {},
    },
    {
      name: "@reforged/maker-appimage",
      platforms: ["linux"],
      config: {
        options: {
          bin: "romsmanager",
          name: "ROM Manager",
          productName: "ROM Manager",
          genericName: "ROM Manager",
          description: "A desktop application for managing retro game ROMs",
          categories: ["Utility", "Game"],
          icon: "./assets/icon.png",
          homepage: "https://github.com/andreakinder/RomsManager",
        },
      },
    },
    {
      name: "@electron-forge/maker-deb",
      platforms: ["linux"],
      config: {
        options: {
          name: "romsmanager",
          productName: "ROM Manager",
          description: "A desktop application for managing retro game ROMs",
          icon: "./assets/icon.png",
          maintainer: "andreakinder",
          homepage: "https://github.com/andreakinder/RomsManager",
          categories: ["Utility", "Game"],
        },
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      platforms: ["linux"],
      config: {
        options: {
          name: "romsmanager",
          productName: "ROM Manager",
          description: "A desktop application for managing retro game ROMs",
          icon: "./assets/icon.png",
          homepage: "https://github.com/andreakinder/RomsManager",
          categories: ["Utility", "Game"],
        },
      },
    },
    {
      name: "@electron-forge/maker-dmg",
      platforms: ["darwin"],
      config: {
        name: "ROM Manager",
        format: "ULFO",
        icon: "./assets/icon.icns",
      },
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
    {
      name: "@electron-forge/plugin-webpack",
      config: {
        mainConfig: "./webpack.main.config.js",
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              html: "./src/index.html",
              js: "./src/renderer.js",
              name: "main_window",
              preload: {
                js: "./src/window/preload.js",
              },
            },
          ],
        },
      },
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "andreakinder",
          name: "RomsManager",
        },
        prerelease: false,
        draft: true,
        // Genera release notes automáticamente desde los commits
        generateReleaseNotes: true,
        // Lista de archivos a publicar (por defecto todos los archivos generados)
        // Los siguientes se generarán automáticamente:
        // - romsmanager-{version} Setup.exe (Windows installer)
        // - romsmanager-portable-win32-x64-{version}.zip (Windows portable)
        // - romsmanager-{version}.AppImage (Linux AppImage para Arch y otras distros)
        // - romsmanager_{version}_amd64.deb (Debian/Ubuntu)
        // - romsmanager-{version}.x86_64.rpm (RPM para Fedora/RedHat/openSUSE)
      },
    },
  ],
};
