import React from 'react';

function CoverImage({ coverPath, customCoverPath, title }) {
  const rawPath = customCoverPath || coverPath;

  // Normalize path: convert backslashes to forward slashes for URI
  const normalizedPath = rawPath ? rawPath.replace(/\\/g, '/') : null;
  // Encode the path to preserve special characters like colons in Windows drive letters
  const encodedPath = normalizedPath ? encodeURIComponent(normalizedPath) : null;
  const displayCover = encodedPath ? `media://${encodedPath}` : null;

  console.log('CoverImage Debug:', { coverPath, customCoverPath, rawPath, normalizedPath, encodedPath, displayCover });

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
