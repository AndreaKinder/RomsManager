import React from "react";
import ConsoleCollection from "../roms/ConsoleCollection";

function ConsoleList({ consoles, onRomUpdated, isCustomCollection = false }) {
  return (
    <div className="consoles-container">
      {consoles.map((console, index) => (
        <ConsoleCollection
          key={
            isCustomCollection
              ? console.collectionName || `collection-${index}`
              : console.consoleId
          }
          console={console}
          onRomUpdated={onRomUpdated}
          isCustomCollection={isCustomCollection}
        />
      ))}
    </div>
  );
}

export default ConsoleList;
