import { useState } from "react";
import {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../constants/messages";

export const useRomOperations = () => {
  const [isLoading, setIsLoading] = useState(false);

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
    handleAddRomFromPC,
  };
};
