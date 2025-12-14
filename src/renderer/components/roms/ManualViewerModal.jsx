import React, { useEffect, useCallback } from "react";

function ManualViewerModal({ manualPath, romTitle, onClose }) {
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target.classList.contains("manual-modal-backdrop")) {
        onClose();
      }
    },
    [onClose],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Convert the file path to use the media:// protocol (same as images)
  const encodedPath = manualPath.split("/").map(encodeURIComponent).join("/");
  const pdfUrl = `media://${encodedPath}`;

  return (
    <div className="manual-modal-backdrop" onClick={handleBackdropClick}>
      <div
        className="manual-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="manual-modal-header">
          <h2>Manual - {romTitle}</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            title="Cerrar (ESC)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="manual-modal-body">
          <iframe
            src={pdfUrl}
            title={`Manual - ${romTitle}`}
            className="manual-pdf-viewer"
          />
        </div>
      </div>
    </div>
  );
}

export default ManualViewerModal;
