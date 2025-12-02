import React, { useState } from "react";
import EditRomModal from "./EditRomModal";

function RomCard({ rom, onRomUpdated }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    setIsModalOpen(false);
    if (onRomUpdated) {
      onRomUpdated();
    }
  };

  return (
    <>
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
        <button
          className="rom-edit-btn"
          onClick={handleEditClick}
          title="Editar ROM"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>
      </div>

      {isModalOpen && (
        <EditRomModal
          rom={rom}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </>
  );
}

export default RomCard;
