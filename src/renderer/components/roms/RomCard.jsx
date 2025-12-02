import React from "react";

function RomCard({ rom }) {
  return (
    <div className="rom-card">
      <div className="rom-card-content">
        <h3 className="rom-title">{rom.title}</h3>
        <div className="rom-details">
          <p>
            <strong>File:</strong> {rom.romName}
          </p>
          <p>
            <strong>Path:</strong> {rom.romPath}
          </p>
        </div>
      </div>
    </div>
  );
}

export default RomCard;
