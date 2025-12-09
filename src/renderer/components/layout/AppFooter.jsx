import React from "react";
import { UI_TEXT } from "../../constants/messages";

const APP_VERSION = "0.2.0-alpha";

function AppFooter({ totalConsoles, totalRoms }) {
  return (
    <footer className="app-footer">
      <p>
        {UI_TEXT.TOTAL_CONSOLES} {totalConsoles} | {UI_TEXT.TOTAL_ROMS}{" "}
        {totalRoms}
      </p>
      <p className="version-info">v{APP_VERSION}</p>
    </footer>
  );
}

export default AppFooter;
