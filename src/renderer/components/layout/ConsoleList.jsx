import React from "react";
import ConsoleCollection from "../roms/ConsoleCollection";

function ConsoleList({ consoles }) {
  return (
    <div className="consoles-container">
      {consoles.map((console) => (
        <ConsoleCollection key={console.consoleId} console={console} />
      ))}
    </div>
  );
}

export default ConsoleList;
