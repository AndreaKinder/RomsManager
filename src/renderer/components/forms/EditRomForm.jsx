import React, { useState, useEffect } from "react";
import SelectConsole from "./SelectConsole";
import FilePickerInput from "./FilePickerInput";
import FormInput from "./FormInput";
import FormButtons from "./FormButtons";
import consolesData from "../../../back/data/consoles.json";

function EditRomForm({ rom, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    file_name: "",
    file_path: "",
    console: "",
    title: "",
    genre: "",
    year: "",
    cover_path: "",
  });

  useEffect(() => {
    if (rom) {
      setFormData({
        file_name: rom.file_name,
        file_path: rom.file_path,
        console: rom.console,
        title: rom.metadata.title || "",
        genre: rom.metadata.genre || "",
        year: rom.metadata.year || "",
        cover_path: rom.cover_path || "",
      });
    }
  }, [rom]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(rom.id, formData);
  };

  const handleFilePicker = async () => {
    const filePath = await window.electronAPI.selectRomFile();
    if (filePath) {
      const fileName = filePath.split(/[\\/]/).pop();
      setFormData({
        ...formData,
        file_path: filePath,
        file_name: fileName,
      });
    }
  };

  const handleCoverPicker = async () => {
    const coverPath = await window.electronAPI.selectCoverImage();
    if (coverPath) {
      setFormData({
        ...formData,
        cover_path: coverPath,
      });
    }
  };

  return (
    <div className="form-container">
      <h2 className="nes-text is-primary">Edit ROM</h2>

      <form onSubmit={handleSubmit}>
        <FilePickerInput
          label="ROM File"
          value={formData.file_path}
          onFilePick={handleFilePicker}
        />

        <div className="form-group">
          <label className="nes-text">Console</label>
          <SelectConsole
            consoles={Object.values(consolesData.consoles)}
            onChange={handleChange}
            name="console"
            value={formData.console}
          />
        </div>

        <FormInput
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Game title..."
          required
        />

        <FormInput
          label="Genre"
          name="genre"
          value={formData.genre}
          onChange={handleChange}
          placeholder="e.g., Action, RPG, Platformer..."
        />

        <FormInput
          label="Year"
          type="number"
          name="year"
          value={formData.year}
          onChange={handleChange}
          placeholder="Release year..."
          min="1970"
          max={new Date().getFullYear()}
        />

        <div className="form-group">
          <label className="nes-text">Cover Image (Optional)</label>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {formData.cover_path && (
              <img
                src={`file://${formData.cover_path}`}
                alt="Cover preview"
                style={{
                  maxWidth: "100px",
                  maxHeight: "100px",
                  objectFit: "contain",
                  imageRendering: "pixelated",
                }}
              />
            )}
            <button
              type="button"
              className="nes-btn"
              onClick={handleCoverPicker}
            >
              Select Cover
            </button>
          </div>
        </div>

        <FormButtons
          onCancel={onCancel}
          submitText="Save Changes"
          cancelText="Cancel"
        />
      </form>
    </div>
  );
}

export default EditRomForm;
