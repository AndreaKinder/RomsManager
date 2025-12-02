import React, { useState } from 'react';
import RomCard from './RomCard';

function ConsoleCollection({ console }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const romsArray = Object.values(console.roms);

  return (
    <div className="console-collection">
      <div
        className="console-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <h2 className="nes-text is-primary">
          <i className={`nes-icon ${isExpanded ? 'chevron-down' : 'chevron-right'}`}></i>
          {console.consoleId}
          <span className="rom-count">({console.romCount} ROMs)</span>
        </h2>
      </div>

      {isExpanded && (
        <div className="roms-grid">
          {romsArray.length > 0 ? (
            romsArray.map((rom, index) => (
              <RomCard key={`${rom.romName}-${index}`} rom={rom} />
            ))
          ) : (
            <p className="nes-text is-disabled">No ROMs in this collection</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ConsoleCollection;
