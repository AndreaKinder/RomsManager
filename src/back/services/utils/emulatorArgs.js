export const EMULATOR_ARG_PRESETS = [
  { id: "default", label: "Por defecto (solo ruta de la ROM)", args: "" },
  { id: "dolphin", label: "Dolphin (GameCube / Wii)", args: '-b -e "{rom}"' },
  { id: "eden", label: "Eden / Yuzu / Ryujinx (Switch)", args: '-f -g "{rom}"' },
  { id: "pcsx2", label: "PCSX2 (PS2 Fullscreen)", args: '-fullscreen -batch "{rom}"' },
  { id: "duckstation", label: "DuckStation (PS1 Fullscreen)", args: '-fullscreen -batch "{rom}"' },
  { id: "ppsspp", label: "PPSSPP (PSP Fullscreen)", args: '--fullscreen "{rom}"' },
  { id: "retroarch", label: "RetroArch (editar ruta de core)", args: '-f -L "/ruta/al/core_libretro.so" "{rom}"' },
];

/**
 * Splits a shell-like argument string into an argv array,
 * preserving quoted segments ("..." and '...').
 */
export function splitArgString(argString) {
  if (!argString || typeof argString !== "string") return [];
  const args = [];
  let current = "";
  let quoteChar = null;

  for (let i = 0; i < argString.length; i++) {
    const ch = argString[i];

    if (quoteChar) {
      if (ch === quoteChar) {
        quoteChar = null;
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      quoteChar = ch;
    } else if (/\s/.test(ch)) {
      if (current.length > 0) {
        args.push(current);
        current = "";
      }
    } else {
      current += ch;
    }
  }

  if (current.length > 0) {
    args.push(current);
  }

  return args;
}

/**
 * Builds the final argv array to launch an emulator with a ROM.
 * Supports placeholders: {rom}, {romDir}, {romName}, {saveDir}, {stateDir}.
 * If {rom} is not present in the template, romPath is appended at the end.
 */
export function buildEmulatorArgs(argsTemplate, romPath, extraContext = {}) {
  const hasRomPlaceholder =
    typeof argsTemplate === "string" && argsTemplate.includes("{rom}");
  const rawTokens = splitArgString(argsTemplate);

  const lastSepIdx = romPath
    ? Math.max(romPath.lastIndexOf("/"), romPath.lastIndexOf("\\"))
    : -1;
  const romDir = romPath && lastSepIdx >= 0 ? romPath.slice(0, lastSepIdx) : "";
  const romName = romPath
    ? lastSepIdx >= 0
      ? romPath.slice(lastSepIdx + 1)
      : romPath
    : "";

  const resolved = rawTokens.map((token) =>
    token
      .replace(/\{rom\}/g, romPath || "")
      .replace(/\{romDir\}/g, romDir)
      .replace(/\{romName\}/g, romName)
      .replace(/\{saveDir\}/g, extraContext.saveDir || "")
      .replace(/\{stateDir\}/g, extraContext.stateDir || ""),
  );

  if (!hasRomPlaceholder && romPath) {
    resolved.push(romPath);
  }

  return resolved;
}
