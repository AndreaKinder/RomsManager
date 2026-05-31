import React, { useState, useCallback } from "react";
import EditRomModal from "./EditRomModal";
import ManualViewerModal from "./ManualViewerModal";
import {
  CONFIRMATION_MESSAGES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../../constants/messages";
import {
  IconDeviceFloppy,
  IconBook,
  IconPlayerPlay,
  IconTrash,
  IconPencil,
  IconDownload
} from "@tabler/icons-react";

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

  const handleLaunchClick = async (e) => {
    e.stopPropagation();

    const emulatorPath = await window.electronAPI.getEmulatorForConsole(
      rom.system,
    );

    if (!emulatorPath) {
      alert(
        `No hay emulador configurado para ${rom.system?.toUpperCase() || "esta consola"}.\n\nConfigurá uno en Ajustes ⚙️.`,
      );
      return;
    }

    const result = await window.electronAPI.launchRom(
      emulatorPath,
      rom.romPath,
    );

    if (!result.success) {
      alert(`Error al lanzar la ROM: ${result.error}`);
    }
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
          <IconDeviceFloppy className="rom-card-bg-icon" size={64} stroke={1.5} />
        )}
        <div className="rom-card-content">
          <div className="rom-details">
            <h3 className="rom-title">{rom.title}</h3>
          </div>
        </div>
        {(rom.savePath || rom.manualPath) && (
          <div className="rom-indicators-container">
            {rom.savePath && (
              <button
                className="rom-save-indicator"
                onClick={handleExportSaveClick}
                title="Exportar partida guardada"
              >
                <IconDeviceFloppy size={16} />
              </button>
            )}
            {rom.manualPath && (
              <button
                className="rom-save-indicator"
                onClick={handleViewManualClick}
                title="Ver manual"
              >
                <IconBook size={16} />
              </button>
            )}
          </div>
        )}
        <div className="rom-card-actions-icons">
          <button
            className="rom-icon-btn btn-play"
            onClick={handleLaunchClick}
            disabled={isDeleting}
            title="Lanzar ROM"
          >
            <IconPlayerPlay size={16} fill="currentColor" />
          </button>
          <button
            className="rom-icon-btn btn-delete"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            title="Eliminar ROM"
          >
            <IconTrash size={16} />
          </button>
          <button
            className="rom-icon-btn btn-edit"
            onClick={handleEditClick}
            disabled={isDeleting}
            title="Editar ROM"
          >
            <IconPencil size={16} />
          </button>
          <button
            className="rom-icon-btn btn-download"
            onClick={handleExportClick}
            disabled={isDeleting}
            title="Exportar ROM"
          >
            <IconDownload size={16} />
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
