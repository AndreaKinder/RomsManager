import React from "react";
import SelectConsoleModal from "./SelectConsoleModal";

export default function AddRomView({ onClose, onSelect }) {
  return <SelectConsoleModal onClose={onSelect} onSelect={onSelect} isInline={true} />;
}
