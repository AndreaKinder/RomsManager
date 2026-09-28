import React from "react";
import { UI_TEXT } from "../../constants/messages";
import pkg from "../../../../package.json";
const APP_VERSION = pkg.version;

function AppFooter({
  totalCollections,
  totalConsoles,
  totalRoms,
  filteredRomsCount,
  customCollectionSelected,
}) {
  return (
    <footer className="app-footer">
      <div className="footer-status">
        <span className="footer-chip">
          {customCollectionSelected ? UI_TEXT.TOTAL_COLLECTIONS : UI_TEXT.TOTAL_CONSOLES}{" "}
          <strong>{customCollectionSelected ? totalCollections : totalConsoles}</strong>
        </span>
        <span className="footer-chip">
          {UI_TEXT.TOTAL_ROMS} <strong>{totalRoms}</strong>
        </span>
        {filteredRomsCount !== null && filteredRomsCount !== totalRoms && (
          <span className="footer-chip footer-chip-filter">
            Mostrando: <strong>{filteredRomsCount}</strong>
          </span>
        )}
      </div>
      <div className="footer-meta">
        <span className="version-info">v{APP_VERSION}</span>
      </div>
    </footer>
  );
}

export default AppFooter;
