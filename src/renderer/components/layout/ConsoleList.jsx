import React from "react";
import ConsoleCollection from "../roms/ConsoleCollection";

function ConsoleList({ consoles, onRomUpdated }) {
  return (
    <div className="consoles-container">
      {consoles.map((console) => (
        <ConsoleCollection
          key={console.consoleId}
          console={console}
          onRomUpdated={onRomUpdated}
        />
      ))}
    </div>
  );
}

export default ConsoleList;
