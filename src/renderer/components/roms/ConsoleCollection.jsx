import React, { useState } from "react";
import RomCard from "./RomCard";

function ConsoleCollection({ console }) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Handle both array and object formats for roms
  const romsArray = Array.isArray(console.roms)
    ? console.roms
    : Object.values(console.roms || {});

  return (
    <div className="console-collection">
      <div
        className="console-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2>
          <span className="chevron">{isExpanded ? "▼" : "▶"}</span>
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
