import React, { useState } from "react";
import RomCard from "./RomCard";

// Import all console icons
const icons = {
  gb: require("../../../assets/icons/systems/gb.png"),
  gbc: require("../../../assets/icons/systems/gbc.png"),
  gba: require("../../../assets/icons/systems/gba.png"),
  genesis: require("../../../assets/icons/systems/genesis.png"),
  nes: require("../../../assets/icons/systems/nes.png"),
  sfc: require("../../../assets/icons/systems/sfc.png"),
  ps: require("../../../assets/icons/systems/ps.png"),
  ps1: require("../../../assets/icons/systems/ps1.png"),
  sega_cd: require("../../../assets/icons/systems/sega_cd.png"),
  generic: require("../../../assets/icons/systems/generic-system.png"),
};

function ConsoleCollection({ console }) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Handle both array and object formats for roms
  const romsArray = Array.isArray(console.roms)
    ? console.roms
    : Object.values(console.roms || {});

  // Get console icon
  const getConsoleIcon = (consoleId) => {
    const iconName = consoleId?.toLowerCase();
    return icons[iconName] || icons.generic;
  };

  return (
    <div className="console-collection">
      <div
        className="console-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2>
          <span className="chevron">{isExpanded ? "▼" : "▶"}</span>
          <img
            src={getConsoleIcon(console.consoleId)}
            alt={console.consoleName || console.consoleId}
            className="console-icon"
          />
          {console.consoleName || console.consoleId}
          <span className="rom-count">({console.romCount} ROMs)</span>
        </h2>
      </div>

      {isExpanded && (
        <div className="roms-grid">
          {romsArray.length > 0 ? (
            romsArray.map((rom, index) => (
              <RomCard key={rom.romName || `rom-${index}`} rom={rom} />
            ))
          ) : (
            <p className="no-roms">No ROMs in this collection</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ConsoleCollection;
