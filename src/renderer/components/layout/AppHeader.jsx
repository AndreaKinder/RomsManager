import React from "react";
import { UI_TEXT, BUTTON_LABELS } from "../../constants/messages";

function AppHeader({
  sdPath,
  onSdPathChange,
  searchQuery,
  onSearchChange,
  onAddRom,
  onImportFromSD,
  onExportToSD,
  onRefresh,
  isLoading,
}) {
  return (
    <header className="app-header">
      <h1>{UI_TEXT.APP_TITLE}</h1>
      <div className="header-inputs">
        <div className="sd-path-input">
          <label>{UI_TEXT.SD_PATH_LABEL}</label>
          <input
            type="text"
            value={sdPath}
            onChange={(e) => onSdPathChange(e.target.value)}
            placeholder={UI_TEXT.SD_PATH_PLACEHOLDER}
          />
        </div>
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
        <button
          className="btn btn-success"
          onClick={onImportFromSD}
          disabled={isLoading}
        >
          {BUTTON_LABELS.IMPORT_FROM_SD}
        </button>
        <button
          className="btn btn-warning"
          onClick={onExportToSD}
          disabled={isLoading}
        >
          {BUTTON_LABELS.EXPORT_TO_SD}
        </button>
        <button className="btn" onClick={onRefresh} disabled={isLoading}>
          {BUTTON_LABELS.REFRESH}
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
