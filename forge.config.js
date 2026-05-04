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
    // Windows: Squirrel installer (.exe Setup)
    {
      name: "@electron-forge/maker-squirrel",
      platforms: ["win32"],
      config: {
        name: "romsmanager",
        setupExe: "ROM-Manager-Setup.exe",
        setupIcon: "./assets/icon.ico",
      },
    },
    // macOS: DMG + ZIP fallback
    {
      name: "@electron-forge/maker-dmg",
      platforms: ["darwin"],
      config: {
        name: "ROM Manager",
        icon: "./assets/icon.icns",
        overwrite: true,
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin", "win32"],
      config: {},
    },
    // Linux: DEB and RPM
    {
      name: "@electron-forge/maker-deb",
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
      name: "@electron-forge/maker-rpm",
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
        generateReleaseNotes: true,
      },
    },
  ],
};
