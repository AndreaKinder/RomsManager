import React, { useState } from "react";
import SelectConsole from "./SelectConsole";
import FilePickerInput from "./FilePickerInput";
import FormInput from "./FormInput";
import FormButtons from "./FormButtons";
import { consoles } from "../../back/data/consoles.json";

function AddRomForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    file_name: "",
    file_path: "",
    console: "",
    title: "",
    genre: "",
    year: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
        title: fileName.replace(/\.[^/.]+$/, ""),
      });
    }
  };

  return (
    <div className="form-container">
      <h2 className="nes-text is-primary">Add New ROM</h2>

      <form onSubmit={handleSubmit}>
        <FilePickerInput
          label="ROM File"
          value={formData.file_path}
          onFilePick={handleFilePicker}
        />

        <div className="form-group">
          <label className="nes-text">Console</label>
          <SelectConsole
            consoles={Object.values(consoles)}
            onChange={(e) =>
              setFormData({ ...formData, console: e.target.value })
            }
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

        <FormButtons
          onCancel={onCancel}
          submitText="Add ROM"
          cancelText="Cancel"
        />
      </form>
    </div>
  );
}

export default AddRomForm;
