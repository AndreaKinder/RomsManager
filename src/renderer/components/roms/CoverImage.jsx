import React from 'react';

function CoverImage({ coverPath, customCoverPath, title }) {
  const displayCover = customCoverPath || coverPath;

  if (!displayCover) {
    return (
      <div className="cover-placeholder">
        <i className="nes-icon is-large trophy"></i>
        <p className="nes-text is-disabled">No Cover</p>
      </div>
    );
  }

  return (
    <div className="cover-container">
      <img
        src={displayCover}
        alt={`${title} cover`}
        className="rom-cover"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div className="cover-placeholder" style={{ display: 'none' }}>
        <i className="nes-icon is-large trophy"></i>
        <p className="nes-text is-disabled">Cover not found</p>
      </div>
      {customCoverPath && (
        <span className="cover-badge nes-badge is-splited">
          <span className="is-dark">Custom</span>
        </span>
      )}
    </div>
  );
}

export default CoverImage;
