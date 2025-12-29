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
  psp: require("../../../assets/icons/systems/generic-system.png"),
  generic: require("../../../assets/icons/systems/generic-system.png"),
};

function ConsoleCollection({
  console,
  onRomUpdated,
  isCustomCollection = false,
}) {
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

  // Get the display name
  const displayName = isCustomCollection
    ? console.collectionName
    : console.consoleName || console.consoleId;

  // Get the icon for custom collections (use generic)
  const displayIcon = isCustomCollection
    ? icons.generic
    : getConsoleIcon(console.consoleId);

  return (
    <div className="console-collection">
      <div
        className="console-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2>
          <span className="chevron">{isExpanded ? "▼" : "▶"}</span>
          <img src={displayIcon} alt={displayName} className="console-icon" />
          {displayName}
          <span className="rom-count">({romsArray.length} ROMs)</span>
        </h2>
      </div>

      {isExpanded && (
        <div className="roms-grid">
          {romsArray.length > 0 ? (
            romsArray.map((rom, index) => (
              <RomCard
                key={rom.romName || `rom-${index}`}
                rom={rom}
                onRomUpdated={onRomUpdated}
              />
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
