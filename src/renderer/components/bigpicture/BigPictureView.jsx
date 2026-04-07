import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "../../../styles/bigpicture.css";

// Gamepad button indices
const GAMEPAD_MAP = {
  0: "select",   // A / Cross
  9: "escape",   // Start
  12: "up",      // D-pad up
  13: "down",    // D-pad down
  14: "left",    // D-pad left
  15: "right",   // D-pad right
};

const GAMEPAD_REPEAT_MS = 180;

function getCoverUrl(coverPath) {
  if (!coverPath) return null;
  const encoded = coverPath.split("/").map(encodeURIComponent).join("/");
  return `media://${encoded}`;
}

// Get element center in document coordinates (accounts for container scroll)
function getDocCenter(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 + window.scrollX,
    y: rect.top + rect.height / 2 + window.scrollY,
  };
}

function BigPictureView({ consoles, onExit }) {
  const [focusedIdx, setFocusedIdx] = useState(0);
  const cardRefsArray = useRef([]);
  const cursorTimerRef = useRef(null);
  const gamepadTimestamps = useRef({});
  const containerRef = useRef(null);

  // Flatten all ROMs into a single ordered array matching card render order
  const flatRoms = useMemo(() => {
    const result = [];
    consoles.forEach((con) => {
      const roms = Array.isArray(con.roms)
        ? con.roms
        : Object.values(con.roms || {});
      roms.forEach((rom) =>
        result.push({
          ...rom,
          _consoleId: rom.system || con.id || con.collectionName,
          _consoleName: con.name || con.collectionName,
        }),
      );
    });
    return result;
  }, [consoles]);

  // Reset card refs array length before each render pass
  cardRefsArray.current = [];

  // ── Cursor hide ────────────────────────────────────────────────────────────
  const resetCursorTimer = useCallback(() => {
    document.body.style.cursor = "default";
    clearTimeout(cursorTimerRef.current);
    cursorTimerRef.current = setTimeout(() => {
      document.body.style.cursor = "none";
    }, 3000);
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", resetCursorTimer);
    resetCursorTimer();
    return () => {
      document.removeEventListener("mousemove", resetCursorTimer);
      clearTimeout(cursorTimerRef.current);
      document.body.style.cursor = "default";
    };
  }, [resetCursorTimer]);

  // ── Scroll focused card into view ──────────────────────────────────────────
  useEffect(() => {
    const el = cardRefsArray.current[focusedIdx];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [focusedIdx]);

  // ── Spatial LRUD navigation ────────────────────────────────────────────────
  const moveFocus = useCallback((direction) => {
    setFocusedIdx((prev) => {
      const cards = cardRefsArray.current;
      const curEl = cards[prev];
      if (!curEl) return prev;

      const { x: cx, y: cy } = getDocCenter(curEl);

      let bestIdx = prev;
      let bestScore = Infinity;

      cards.forEach((card, idx) => {
        if (idx === prev || !card) return;
        const { x: nx, y: ny } = getDocCenter(card);
        const dx = nx - cx;
        const dy = ny - cy;

        let primary, secondary;
        switch (direction) {
          case "right":
            if (dx <= 5) return;
            primary = dx;
            secondary = Math.abs(dy);
            break;
          case "left":
            if (dx >= -5) return;
            primary = -dx;
            secondary = Math.abs(dy);
            break;
          case "down":
            if (dy <= 5) return;
            primary = dy;
            secondary = Math.abs(dx);
            break;
          case "up":
            if (dy >= -5) return;
            primary = -dy;
            secondary = Math.abs(dx);
            break;
          default:
            return;
        }

        // Weight perpendicular distance more heavily to prefer aligned cards
        const score = primary + secondary * 0.7;
        if (score < bestScore) {
          bestScore = score;
          bestIdx = idx;
        }
      });

      return bestIdx;
    });
  }, []);

  // ── Select (launch) ROM by index ───────────────────────────────────────────
  const launchRomByIdx = useCallback(async (idx) => {
    const rom = flatRoms[idx];
    if (!rom) return;

    const emulatorPath = await window.electronAPI.getEmulatorForConsole(
      rom._consoleId,
    );
    if (!emulatorPath) {
      alert(
        `No emulator configured for ${rom._consoleName?.toUpperCase() || rom._consoleId}.\n\nSet one up in Settings ⚙️.`,
      );
      return;
    }
    await window.electronAPI.launchRom(emulatorPath, rom.romPath);
  }, [flatRoms]);

  const selectFocused = useCallback(() => {
    launchRomByIdx(focusedIdx);
  }, [launchRomByIdx, focusedIdx]);

  // ── Keyboard navigation ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      resetCursorTimer();
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          moveFocus("right");
          break;
        case "ArrowLeft":
          e.preventDefault();
          moveFocus("left");
          break;
        case "ArrowDown":
          e.preventDefault();
          moveFocus("down");
          break;
        case "ArrowUp":
          e.preventDefault();
          moveFocus("up");
          break;
        case "Enter":
          e.preventDefault();
          selectFocused();
          break;
        case "Escape":
          e.preventDefault();
          onExit();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveFocus, selectFocused, onExit, resetCursorTimer]);

  // ── Gamepad polling ────────────────────────────────────────────────────────
  useEffect(() => {
    let rafId;

    const poll = (timestamp) => {
      const gamepads = navigator.getGamepads();
      for (const gp of gamepads) {
        if (!gp) continue;
        for (const [idx, action] of Object.entries(GAMEPAD_MAP)) {
          const pressed = gp.buttons[Number(idx)]?.pressed;
          const lastTs = gamepadTimestamps.current[idx] || 0;
          if (pressed && timestamp - lastTs > GAMEPAD_REPEAT_MS) {
            gamepadTimestamps.current[idx] = timestamp;
            if (action === "select") selectFocused();
            else if (action === "escape") onExit();
            else moveFocus(action);
          } else if (!pressed) {
            gamepadTimestamps.current[idx] = 0;
          }
        }
      }
      rafId = requestAnimationFrame(poll);
    };

    rafId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafId);
  }, [moveFocus, selectFocused, onExit]);

  // ── Render ─────────────────────────────────────────────────────────────────
  let globalCardIdx = 0;

  return (
    <div className="bp-container" ref={containerRef}>
      {/* Fixed top bar */}
      <div className="bp-header">
        <span className="bp-logo">Big Picture</span>
        <button className="bp-exit-btn" onClick={onExit} tabIndex={-1}>
          ✕ Exit
        </button>
      </div>

      {/* Scrollable content */}
      <div className="bp-scroll-area">
        {consoles.map((con) => {
          const roms = Array.isArray(con.roms)
            ? con.roms
            : Object.values(con.roms || {});
          if (!roms.length) return null;
          const consoleId = con.id || con.collectionName;

          return (
            <section key={consoleId} className="bp-section">
              <h2 className="bp-section-title">
                {con.icon && (
                  <span className="bp-section-icon">{con.icon}</span>
                )}
                {con.name || con.collectionName}
                <span className="bp-section-count">{roms.length}</span>
              </h2>

              <div className="bp-grid">
                {roms.map((rom) => {
                  const cardIdx = globalCardIdx++;
                  const isFocused = cardIdx === focusedIdx;

                  return (
                    <div
                      key={rom.romName}
                      ref={(el) => {
                        if (el) cardRefsArray.current[cardIdx] = el;
                      }}
                      className={`bp-card${isFocused ? " focused" : ""}`}
                      onClick={() => {
                        setFocusedIdx(cardIdx);
                        launchRomByIdx(cardIdx);
                      }}
                      onMouseEnter={() => setFocusedIdx(cardIdx)}
                    >
                      {rom.coverPath ? (
                        <div
                          className="bp-card-cover"
                          style={{
                            backgroundImage: `url("${getCoverUrl(rom.coverPath)}")`,
                          }}
                        />
                      ) : (
                        <div className="bp-card-no-cover">
                          <span className="bp-card-placeholder-icon">🎮</span>
                        </div>
                      )}
                      <div className="bp-card-title">{rom.title}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default BigPictureView;
