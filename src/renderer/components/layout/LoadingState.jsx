import React from "react";
import { UI_TEXT } from "../../constants/messages";

function LoadingState() {
  return (
    <div className="loading-container">
      <p className="nes-text">{UI_TEXT.LOADING}</p>
    </div>
  );
}

export default LoadingState;
