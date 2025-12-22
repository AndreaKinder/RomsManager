import React from "react";
import { UI_TEXT } from "../../constants/messages";

const APP_VERSION = "0.2.0-alpha";

function AppFooter({ totalConsoles, totalRoms, filteredRomsCount }) {
  return (
    <footer className="app-footer">
      <p>
        {UI_TEXT.TOTAL_COLLECTIONS} {totalCollections} |{" "}
        {UI_TEXT.TOTAL_CONSOLES} {totalConsoles} | {UI_TEXT.TOTAL_ROMS}{" "}
        {totalRoms}
        {filteredRomsCount !== null && filteredRomsCount !== totalRoms && (
          <span className="filtered-count">
            {" "}
            | Mostrando: {filteredRomsCount}
          </span>
        )}
      </p>
      <p className="version-info">v{APP_VERSION}</p>
    </footer>
  );
}

export default AppFooter;
