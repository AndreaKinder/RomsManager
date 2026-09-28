import React from "react";
import { UI_TEXT, BUTTON_LABELS } from "../../constants/messages";
import {
  IconX,
  IconSearch,
  IconSettings,
  IconDeviceTv,
  IconPlus,
  IconDeviceGamepad2,
  IconLayoutDashboard,
  IconBrandAndroid,
} from "@tabler/icons-react";

function AppHeader({
  searchQuery,
  onSearchChange,
  onAddRom,
  onOpenSettings,
  onOpenAndroidSync,
  onEnterBigPicture,
  isLoading,
  onOpenCustomCollectionSelect,
  onOpenCustomCollectionSelected = false,
}) {
  return (
    <header className="md3-top-app-bar">
      <div className="top-bar-brand">
        <IconDeviceGamepad2 size={24} className="top-bar-brand-icon" />
        <span className="top-bar-brand-title">ROM Manager</span>
      </div>

      <div className="top-bar-search-container">
        <IconSearch size={18} className="search-leading-icon" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={UI_TEXT.SEARCH_PLACEHOLDER}
          className="search-input"
        />
        {searchQuery && (
          <button
            className="clear-search"
            onClick={() => onSearchChange("")}
            title={UI_TEXT.CLEAR_SEARCH}
          >
            <IconX size={14} />
          </button>
        )}
      </div>

      <div className="top-bar-actions">
        <button
          className="btn btn-tonal btn-add-rom"
          onClick={onAddRom}
          disabled={isLoading}
          title={BUTTON_LABELS.ADD_ROM}
        >
          <IconPlus size={18} />
          <span className="btn-text-label">Añadir ROM</span>
        </button>
        <button
          className="btn btn-icon btn-android-sync"
          onClick={onOpenAndroidSync}
          disabled={isLoading}
          title="Sincronizar con consola Android (USB)"
        >
          <IconBrandAndroid size={20} />
        </button>
        <button
          className={`btn btn-icon btn-toggle ${onOpenCustomCollectionSelected ? "active" : ""}`}
          onClick={onOpenCustomCollectionSelect}
          disabled={isLoading}
          title={
            onOpenCustomCollectionSelected
              ? BUTTON_LABELS.CUSTOM_COLLECTION_SELECTED
              : BUTTON_LABELS.SYSTEM_COLLECTION_SELECTED
          }
        >
          {onOpenCustomCollectionSelected ? (
            <IconLayoutDashboard size={20} />
          ) : (
            <IconDeviceGamepad2 size={20} />
          )}
        </button>
        <button
          className="btn btn-icon btn-bigpicture"
          onClick={onEnterBigPicture}
          disabled={isLoading}
          title="Big Picture mode (TV / gamepad)"
        >
          <IconDeviceTv size={20} />
        </button>
        <button
          className="btn btn-icon"
          onClick={onOpenSettings}
          disabled={isLoading}
          title={BUTTON_LABELS.SETTINGS}
        >
          <IconSettings size={20} />
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
