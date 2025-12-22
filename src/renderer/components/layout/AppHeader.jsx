import React from "react";
import { UI_TEXT, BUTTON_LABELS } from "../../constants/messages";

function AppHeader({
  searchQuery,
  onSearchChange,
  onAddRom,
  onOpenSettings,
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
              ✕
            </button>
          )}
        </div>
      </div>
      <div className="header-actions">
        <button
          className="btn btn-primary"
          onClick={onAddRom}
          disabled={isLoading}
        >
          {BUTTON_LABELS.ADD_ROM}
        </button>
        <button className="btn" onClick={onOpenSettings} disabled={isLoading}>
          {BUTTON_LABELS.SETTINGS}
        </button>

        <button
          className={`btn btn-toggle ${onOpenCustomCollectionSelected ? "active" : ""}`}
          onClick={onOpenCustomCollectionSelect}
          disabled={isLoading}
        >
          {onOpenCustomCollectionSelected
            ? BUTTON_LABELS.CUSTOM_COLLECTION_SELECTED
            : BUTTON_LABELS.SYSTEM_COLLECTION_SELECTED}
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
