import React from "react";
import SettingsModal from "./SettingsModal";

export default function SettingsView({ onClose }) {
  return <SettingsModal onClose={onClose} isInline={true} />;
}
