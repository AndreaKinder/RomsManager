import React from 'react';

function RomsList({ roms, onDelete }) {
  if (roms.length === 0) {
    return (
      <div className="empty-state">
        <i className="nes-icon is-large star"></i>
        <h2 className="nes-text">No ROMs yet</h2>
        <p className="nes-text is-disabled">Add your first ROM to get started!</p>
      </div>
    );
  }

  return (
    <div className="roms-grid">
      {roms.map(rom => (
        <div key={rom.id} className="nes-container is-dark rom-card">
          <h3>{rom.metadata.title || rom.file_name}</h3>

          <div className="rom-info">
            <p><strong>Console:</strong> {rom.console || 'Unknown'}</p>
            <p><strong>File:</strong> {rom.file_name}</p>
            {rom.metadata.genre && <p><strong>Genre:</strong> {rom.metadata.genre}</p>}
            {rom.metadata.year && <p><strong>Year:</strong> {rom.metadata.year}</p>}
          </div>

          {rom.favorite && (
            <i className="nes-icon is-small star"></i>
          )}

          <div className="rom-actions">
            <button className="nes-btn is-warning" disabled>
              Edit
            </button>
            <button
              className="nes-btn is-error"
              onClick={() => {
                if (confirm(`Delete "${rom.metadata.title || rom.file_name}"?`)) {
                  onDelete(rom.id);
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RomsList;
