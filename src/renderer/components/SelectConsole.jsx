import React from "react";

export default function SelectConsole({ consoles, value, onChange }) {
  return (
    <select value={value} onChange={onChange}>
      {consoles.map((console) => (
        <option key={console.id} value={console.id_name}>
          {console.name}
        </option>
      ))}
    </select>
  );
}
