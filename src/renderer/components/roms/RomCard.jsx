import React, { useState, useCallback } from "react";
import EditRomModal from "./EditRomModal";
import ManualViewerModal from "./ManualViewerModal";
import {
  CONFIRMATION_MESSAGES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../../constants/messages";

function RomCard({ rom, onRomUpdated }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
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

  const handleExportClick = async (e) => {
    e.stopPropagation();

    try {
      const result = await window.electronAPI.exportRomCopy(rom.romPath);

      if (result.success) {
        alert(
          `ROM "${rom.title}" exportada correctamente a: ${result.filePath}`,
        );
      } else if (result.error !== "Export cancelled") {
        alert(`Error al exportar la ROM: ${result.error}`);
      }
    } catch (error) {
      alert(`Error al exportar la ROM: ${error.message}`);
    }
  };

  const handleExportSaveClick = async (e) => {
    e.stopPropagation();

    if (!rom.savePath) {
      alert("No hay partida guardada para esta ROM");
      return;
    }

    try {
      const result = await window.electronAPI.exportSaveCopy(rom.savePath);

      if (result.success) {
        alert(
          `Partida guardada de "${rom.title}" exportada correctamente a: ${result.filePath}`,
        );
      } else if (result.error !== "Export cancelled") {
        alert(`Error al exportar la partida: ${result.error}`);
      }
    } catch (error) {
      alert(`Error al exportar la partida: ${error.message}`);
    }
  };
  const handleViewManualClick = useCallback((e) => {
    e.stopPropagation();
    setIsManualModalOpen(true);
  }, []);

  const handleCloseManualModal = useCallback(() => {
    setIsManualModalOpen(false);
  }, []);

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

  // Log cover path for debugging
  React.useEffect(() => {
    if (rom.coverPath) {
      console.log("ROM Cover Info:", {
        romName: rom.romName,
        coverPath: rom.coverPath,
        encodedPath: encodeURIComponent(rom.coverPath),
        fullURL: `media://${encodeURIComponent(rom.coverPath)}`,
      });
    }
  }, [rom.coverPath, rom.romName]);

  // Generate the cover URL properly
  const getCoverUrl = (coverPath) => {
    if (!coverPath) return null;
    // Don't encode slashes - only encode the path components
    const encodedPath = coverPath.split("/").map(encodeURIComponent).join("/");
    return `media://${encodedPath}`;
  };

  return (
    <>
      <div className="rom-card">
        {rom.coverPath ? (
          <div
            className="rom-card-cover"
            style={{
              backgroundImage: `url("${getCoverUrl(rom.coverPath)}")`,
            }}
          ></div>
        ) : (
          <svg
            className="rom-card-bg-icon"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="Floppy-disk">
              <path d="M35.2673988,6.0411h-7.9999981v10h7.9999981V6.0411z M33.3697014,14.1434002h-4.2046013V7.9387999h4.2046013V14.1434002z"></path>
              <path d="M41,47.0410995H21c-0.5527992,0-1,0.4472008-1,1c0,0.5527,0.4472008,1,1,1h20c0.5527,0,1-0.4473,1-1 C42,47.4883003,41.5527,47.0410995,41,47.0410995z"></path>
              <path d="M41,39.0410995H21c-0.5527992,0-1,0.4472008-1,1c0,0.5527,0.4472008,1,1,1h20c0.5527,0,1-0.4473,1-1 C42,39.4883003,41.5527,39.0410995,41,39.0410995z"></path>
              <path d="M12,56.0410995h38v-26H12V56.0410995z M14,32.0410995h34v22H14V32.0410995z"></path>
              <path d="M49.3811989,0.0411L49.3610992,0H7C4.7908001,0,3,1.7909,3,4v56c0,2.2092018,1.7908001,4,4,4h50 c2.2090988,0,4-1.7907982,4-4V11.6962996L49.3811989,0.0411z M39.9604988,2.0804999v17.9211006H14.0394001V2.0804999H39.9604988z M59,60c0,1.1027985-0.8972015,2-2,2H7c-1.1027999,0-2-0.8972015-2-2V4c0-1.1027999,0.8972001-2,2-2h5v20.0410995h30V2h6.5099983 L59,12.5228996V60z"></path>
            </g>
          </svg>
        )}
        <div className="rom-card-content">
          <div className="rom-details">
            <h3 className="rom-title">{rom.title}</h3>
          </div>
        </div>
        {rom.savePath && (
          <button
            className="rom-save-indicator"
            onClick={handleExportSaveClick}
            title="Exportar partida guardada"
          >
            💾
          </button>
        )}
        {rom.manualPath && (
          <button
            className="rom-save-indicator"
            onClick={handleViewManualClick}
            title="Ver manual"
          >
            📑
          </button>
        )}
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
          <button
            className="rom-icon-btn btn-download"
            onClick={handleExportClick}
            disabled={isDeleting}
            title="Exportar ROM"
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
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

      {isManualModalOpen && rom.manualPath && (
        <ManualViewerModal
          manualPath={rom.manualPath}
          romTitle={rom.title}
          onClose={handleCloseManualModal}
        />
      )}
    </>
  );
}

export default RomCard;
