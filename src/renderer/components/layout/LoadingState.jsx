import React from "react";
import { UI_TEXT } from "../../constants/messages";

function LoadingState() {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="md3-circular-progress">
        <svg className="md3-circular-progress-svg" viewBox="22 22 44 44">
          <circle
            className="md3-circular-progress-circle"
            cx="44"
            cy="44"
            r="20.2"
            fill="none"
            strokeWidth="3.6"
          />
        </svg>
      </div>
      <p className="loading-text">{UI_TEXT.LOADING}</p>
    </div>
  );
}

export default LoadingState;
