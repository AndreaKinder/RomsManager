import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import "../../../styles/bigpicture.css";

// Gamepad button indices
const GAMEPAD_MAP = {
  0: "select", // A / Cross
  1: "back",   // B / Circle
  9: "escape", // Start
  12: "up", // D-pad up
  13: "down", // D-pad down
  14: "left", // D-pad left
  15: "right", // D-pad right
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
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState(null);
  
  const cardRefsArray = useRef([]);
  const cursorTimerRef = useRef(null);
  
  const gamepadState = useRef({}); // [padIndex][buttonIdx] = { wasPressed, ts }
  
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

  // Clamp focusedIdx if flatRoms shrinks
  useEffect(() => {
    setFocusedIdx(prev => {
      if (flatRoms.length === 0) return 0;
      return prev >= flatRoms.length ? flatRoms.length - 1 : prev;
    });
    // Shrink refs array if needed to avoid stale refs
    if (cardRefsArray.current.length > flatRoms.length) {
      cardRefsArray.current.length = flatRoms.length;
    }
  }, [flatRoms.length]);

  // ── Cursor hide ────────────────────────────────────────────────────────────
  const resetCursorTimer = useCallback(() => {
    if (!containerRef.current) return;
    containerRef.current.style.cursor = "default";
    clearTimeout(cursorTimerRef.current);
    cursorTimerRef.current = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.cursor = "none";
      }
    }, 3000);
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", resetCursorTimer);
    resetCursorTimer();
    return () => {
      document.removeEventListener("mousemove", resetCursorTimer);
      clearTimeout(cursorTimerRef.current);
      if (containerRef.current) {
        containerRef.current.style.cursor = "default";
      }
    };
  }, [resetCursorTimer]);

  // ── Scroll focused card into view ──────────────────────────────────────────
  useEffect(() => {
    const el = cardRefsArray.current[focusedIdx];
    if (el) {
      el.scrollIntoView({
        behavior: "auto", // Snappy for gamepad
        block: "nearest",
        inline: "nearest",
      });
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
  const launchRomByIdx = useCallback(
    async (idx) => {
      if (isLaunching || launchError) return;
      const rom = flatRoms[idx];
      if (!rom) return;

      setIsLaunching(true);
      try {
        const emulatorPath = await window.electronAPI.getEmulatorForConsole(
          rom._consoleId,
        );
        if (!emulatorPath) {
          setLaunchError(
            `No hay emulador configurado para ${rom._consoleName?.toUpperCase() || rom._consoleId}.\n\nConfiguralo en Settings ⚙️.`
          );
          return;
        }
        await window.electronAPI.launchRom(emulatorPath, rom.romPath);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLaunching(false);
      }
    },
    [flatRoms, isLaunching, launchError],
  );

  const selectFocused = useCallback(() => {
    launchRomByIdx(focusedIdx);
  }, [launchRomByIdx, focusedIdx]);

  // Refs for current callbacks to avoid re-mounting event listeners / poll loops
  const stateRefs = useRef({ moveFocus, selectFocused, onExit, isLaunching, launchError, setLaunchError });
  useEffect(() => {
    stateRefs.current = { moveFocus, selectFocused, onExit, isLaunching, launchError, setLaunchError };
  });

  // ── Keyboard navigation ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if outside
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      
      const { moveFocus, selectFocused, onExit, launchError, setLaunchError } = stateRefs.current;
      resetCursorTimer();
      
      if (launchError) {
        if (e.key === "Enter" || e.key === "Escape" || e.key === " ") {
          e.preventDefault();
          setLaunchError(null);
        }
        return; // lock inputs
      }

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
  }, [resetCursorTimer]);

  // ── Gamepad polling ────────────────────────────────────────────────────────
  useEffect(() => {
    let rafId;

    const poll = (timestamp) => {
      const { moveFocus, selectFocused, onExit, isLaunching, launchError, setLaunchError } = stateRefs.current;
      const gamepads = navigator.getGamepads();
      
      // Deduplicate actions in the same frame
      const actionsThisFrame = new Set();

      for (const gp of gamepads) {
        if (!gp) continue;
        
        if (!gamepadState.current[gp.index]) {
          gamepadState.current[gp.index] = {};
        }
        const state = gamepadState.current[gp.index];

        for (const [btnIdx, action] of Object.entries(GAMEPAD_MAP)) {
          const pressed = gp.buttons[Number(btnIdx)]?.pressed;
          if (!state[btnIdx]) state[btnIdx] = { wasPressed: false, ts: 0 };
          
          const btnState = state[btnIdx];

          if (pressed && !btnState.wasPressed) {
            // Rising edge (just pressed)
            btnState.wasPressed = true;
            btnState.ts = timestamp;
            
            if (launchError) {
              if (action === "select" || action === "back" || action === "escape") {
                setLaunchError(null);
              }
              continue;
            }
            if (isLaunching) continue;

            if (!actionsThisFrame.has(action)) {
              actionsThisFrame.add(action);
              if (action === "select") selectFocused();
              else if (action === "escape" || action === "back") onExit();
              else moveFocus(action);
            }
            
          } else if (pressed && btnState.wasPressed && timestamp - btnState.ts > GAMEPAD_REPEAT_MS) {
            // Hold repeat
            btnState.ts = timestamp;
            
            if (launchError || isLaunching) continue;
            
            // Only repeat directional movements
            if (["up", "down", "left", "right"].includes(action) && !actionsThisFrame.has(action)) {
              actionsThisFrame.add(action);
              moveFocus(action);
            }
          } else if (!pressed) {
            // Release
            btnState.wasPressed = false;
            btnState.ts = 0;
          }
        }
      }
      rafId = requestAnimationFrame(poll);
    };

    rafId = requestAnimationFrame(poll);
    
    const onGamepadConnected = (e) => {
      console.log("Gamepad connected:", e.gamepad.id);
    };
    window.addEventListener("gamepadconnected", onGamepadConnected);
    
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("gamepadconnected", onGamepadConnected);
    };
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  let globalCardIdx = 0;

  return (
    <div className="bp-container" ref={containerRef}>
      {/* Fixed top bar */}
      <div className="bp-header">
        <span className="bp-logo">Big Picture</span>
        <button className="bp-exit-btn" onClick={onExit} tabIndex={-1}>
          Exit
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
                      key={rom.romPath || cardIdx}
                      ref={(el) => {
                        cardRefsArray.current[cardIdx] = el;
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

      {/* Error Modal */}
      {launchError && (
        <div className="modal-backdrop" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ maxWidth: 400, textAlign: "center" }}>
            <div className="modal-body" style={{ padding: "30px 20px" }}>
              <p style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: "14px" }}>{launchError}</p>
            </div>
            <div className="modal-footer" style={{ justifyContent: "center" }}>
              <button className="btn btn-primary" onClick={() => setLaunchError(null)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BigPictureView;
