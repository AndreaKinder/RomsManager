import React from "react";
import { UI_TEXT, BUTTON_LABELS } from "../../constants/messages";
import {
  IconX,
  IconSettings,
  IconDeviceTv,
  IconPlus,
  IconDeviceGamepad2,
  IconLayoutDashboard
} from "@tabler/icons-react";

function AppHeader({
  searchQuery,
  onSearchChange,
  onAddRom,
  onOpenSettings,
  onEnterBigPicture,
  isLoading,
  onOpenCustomCollectionSelect,
  onOpenCustomCollectionSelected = false,
}) {
  return (
    <header className="app-header">
      <h1>{UI_TEXT.APP_TITLE}</h1>
      <div className="header-inputs">
        <div className="search-input">
          <label>{UI_TEXT.SEARCH_LABEL}</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={UI_TEXT.SEARCH_PLACEHOLDER}
          />
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => onSearchChange("")}
              title={UI_TEXT.CLEAR_SEARCH}
            >
              <IconX size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="header-actions">
        <button
          className="btn btn-primary"
          onClick={onAddRom}
          disabled={isLoading}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <IconPlus size={18} />
          {BUTTON_LABELS.ADD_ROM}
        </button>
        <button
          className="btn"
          onClick={onOpenSettings}
          disabled={isLoading}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <IconSettings size={18} />
          {BUTTON_LABELS.SETTINGS}
        </button>
        <button
          className="btn btn-bigpicture"
          onClick={onEnterBigPicture}
          disabled={isLoading}
          title="Big Picture mode (TV / gamepad)"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <IconDeviceTv size={18} />
          Big Picture
        </button>

        <button
          className={`btn btn-toggle ${onOpenCustomCollectionSelected ? "active" : ""}`}
          onClick={onOpenCustomCollectionSelect}
          disabled={isLoading}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          {onOpenCustomCollectionSelected ? (
            <>
              <IconLayoutDashboard size={18} />
              {BUTTON_LABELS.CUSTOM_COLLECTION_SELECTED}
            </>
          ) : (
            <>
              <IconDeviceGamepad2 size={18} />
              {BUTTON_LABELS.SYSTEM_COLLECTION_SELECTED}
            </>
          )}
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
