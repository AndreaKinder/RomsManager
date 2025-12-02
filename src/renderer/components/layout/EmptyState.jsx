import React from "react";
import { UI_TEXT } from "../../constants/messages";

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-card">
        <p className="empty-title">{UI_TEXT.NO_COLLECTIONS_TITLE}</p>
        <p>{UI_TEXT.NO_COLLECTIONS_MESSAGE}</p>
      </div>
    </div>
  );
}

export default EmptyState;
