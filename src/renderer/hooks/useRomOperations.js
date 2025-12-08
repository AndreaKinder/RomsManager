import { useState } from "react";
import {
  CONFIRMATION_MESSAGES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../constants/messages";

export const useRomOperations = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleImportFromSD = async (sdPath, onSuccess) => {
    if (isLoading) return;

    const confirmed = window.confirm(
      CONFIRMATION_MESSAGES.IMPORT_FROM_SD(sdPath),
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const result = await window.electronAPI.importRomsSD(sdPath);
      if (result.success) {
        alert(SUCCESS_MESSAGES.IMPORT_FROM_SD);
        await onSuccess();
      } else {
        alert(
          ERROR_MESSAGES.IMPORT_ROMS(
            result.error || ERROR_MESSAGES.UNKNOWN_ERROR,
          ),
        );
      }
    } catch (error) {
      alert(ERROR_MESSAGES.IMPORT_ROMS(error.message));
    }
    setIsLoading(false);
  };

  const handleExportToSD = async (sdPath) => {
    if (isLoading) return;

    const confirmed = window.confirm(
      CONFIRMATION_MESSAGES.EXPORT_TO_SD(sdPath),
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const result = await window.electronAPI.exportRomsToSD(sdPath);
      if (result.success) {
        alert(SUCCESS_MESSAGES.EXPORT_TO_SD);
      } else {
        alert(
          ERROR_MESSAGES.EXPORT_ROMS(
            result.error || ERROR_MESSAGES.UNKNOWN_ERROR,
          ),
        );
      }
    } catch (error) {
      alert(ERROR_MESSAGES.EXPORT_ROMS(error.message));
    }
    setIsLoading(false);
  };

  const handleAddRomFromPC = async (
    selectedConsole,
    romFilePath,
    onSuccess,
  ) => {
    if (isLoading) return;

    if (!selectedConsole) {
      alert(ERROR_MESSAGES.ADD_ROM("Please select a console first"));
      return;
    }

    if (!romFilePath) {
      alert(ERROR_MESSAGES.ADD_ROM("Please select a ROM file"));
      return;
    }

    setIsLoading(true);
    try {
      const result = await window.electronAPI.addRomFromPC(
        selectedConsole,
        romFilePath,
      );

      if (result.canceled) {
        setIsLoading(false);
        return;
      }

      if (result.success) {
        alert(SUCCESS_MESSAGES.ADD_ROM(result.romName, result.system));
        await onSuccess();
      } else {
        alert(
          ERROR_MESSAGES.ADD_ROM(result.error || ERROR_MESSAGES.UNKNOWN_ERROR),
        );
      }
    } catch (error) {
      alert(ERROR_MESSAGES.ADD_ROM(error.message));
    }
    setIsLoading(false);
  };

  return {
    isLoading,
    handleImportFromSD,
    handleExportToSD,
    handleAddRomFromPC,
  };
};
