import React, { useState } from 'react';

function AddRomForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    file_name: '',
    file_path: '',
    console: '',
    title: '',
    genre: '',
    year: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleFilePicker = async () => {
    const filePath = await window.electronAPI.selectRomFile();
    if (filePath) {
      const fileName = filePath.split(/[\\/]/).pop();
      setFormData({
        ...formData,
        file_path: filePath,
        file_name: fileName,
        title: fileName.replace(/\.[^/.]+$/, '')
      });
    }
  };

  return (
    <div className="form-container">
      <h2 className="nes-text is-primary">Add New ROM</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="nes-text">ROM File</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="nes-input"
              value={formData.file_path}
              placeholder="Select a ROM file..."
              readOnly
            />
            <button
              type="button"
              className="nes-btn"
              onClick={handleFilePicker}
            >
              Browse
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="nes-text">Console</label>
          <div className="nes-select">
            <select
              name="console"
              value={formData.console}
              onChange={handleChange}
              required
            >
              <option value="">Select console...</option>
              <option value="NES">NES</option>
              <option value="SNES">SNES</option>
              <option value="GBA">Game Boy Advance</option>
              <option value="GBC">Game Boy Color</option>
              <option value="N64">Nintendo 64</option>
              <option value="PS1">PlayStation 1</option>
              <option value="PS2">PlayStation 2</option>
              <option value="Genesis">Sega Genesis</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="nes-text">Title</label>
          <input
            type="text"
            className="nes-input"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Game title..."
            required
          />
        </div>

        <div className="form-group">
          <label className="nes-text">Genre</label>
          <input
            type="text"
            className="nes-input"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            placeholder="e.g., Action, RPG, Platformer..."
          />
        </div>

        <div className="form-group">
          <label className="nes-text">Year</label>
          <input
            type="number"
            className="nes-input"
            name="year"
            value={formData.year}
            onChange={handleChange}
            placeholder="Release year..."
            min="1970"
            max={new Date().getFullYear()}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="nes-btn is-success">
            Add ROM
          </button>
          <button type="button" className="nes-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddRomForm;
