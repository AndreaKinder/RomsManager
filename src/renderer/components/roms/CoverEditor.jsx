import React, { useState } from 'react';

function CoverEditor({ romId, currentCover, customCover, onCoverChange }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSelectCover = async () => {
    const coverPath = await window.electronAPI.selectCoverImage();
    if (coverPath) {
      onCoverChange(romId, coverPath);
      setIsEditing(false);
    }
  };

  const handleRemoveCover = () => {
    if (confirm('Remove custom cover and restore original?')) {
      onCoverChange(romId, null);
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        className="nes-btn is-primary cover-edit-btn"
        onClick={() => setIsEditing(true)}
      >
        {customCover || currentCover ? 'Change Cover' : 'Add Cover'}
      </button>
    );
  }

  return (
    <div className="cover-editor">
      <button
        className="nes-btn is-success"
        onClick={handleSelectCover}
      >
        Select Image
      </button>
      {customCover && (
        <button
          className="nes-btn is-warning"
          onClick={handleRemoveCover}
        >
          Remove Custom
        </button>
      )}
      <button
        className="nes-btn"
        onClick={() => setIsEditing(false)}
      >
        Cancel
      </button>
    </div>
  );
}

export default CoverEditor;
