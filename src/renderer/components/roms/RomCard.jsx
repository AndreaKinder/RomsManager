import React, { useState } from "react";
import EditRomModal from "./EditRomModal";
import {
  CONFIRMATION_MESSAGES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../../constants/messages";

function RomCard({ rom, onRomUpdated }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      CONFIRMATION_MESSAGES.DELETE_ROM(rom.title),
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const result = await window.electronAPI.deleteRom(rom.romName);

      if (result.success) {
        alert(SUCCESS_MESSAGES.DELETE_ROM(rom.title));
        if (onRomUpdated) {
          try {
            await onRomUpdated();
          } catch (callbackError) {
            console.error("Error in onRomUpdated callback:", callbackError);
          }
        }
      } else {
        alert(ERROR_MESSAGES.DELETE_ROM(result.error));
      }
    } catch (error) {
      alert(ERROR_MESSAGES.DELETE_ROM(error.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    setIsModalOpen(false);
    if (onRomUpdated) {
      try {
        await onRomUpdated();
      } catch (callbackError) {
        console.error("Error in onRomUpdated callback:", callbackError);
      }
    }
  };

  return (
    <>
      <div className="rom-card">
        <div className="rom-card-content">
          <h3 className="rom-title">{rom.title}</h3>
          <div className="rom-details">
            <p>
              <strong>Archivo:</strong> {rom.romName}
            </p>
            <p>
              <strong>Ruta:</strong> {rom.romPath}
            </p>
          </div>
        </div>
        <div className="rom-card-actions-icons">
          <button
            className="rom-icon-btn btn-delete"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            title="Eliminar ROM"
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
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
          <button
            className="rom-icon-btn btn-edit"
            onClick={handleEditClick}
            disabled={isDeleting}
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
