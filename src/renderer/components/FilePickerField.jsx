import React from 'react';

function FilePickerField({ label, value, onFilePick }) {
  return (
    <div className="form-group">
      <label className="nes-text">{label}</label>
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          className="nes-input"
          value={value}
          placeholder="Select a ROM file..."
          readOnly
        />
        <button
          type="button"
          className="nes-btn"
          onClick={onFilePick}
        >
          Browse
        </button>
      </div>
    </div>
  );
}

export default FilePickerField;
