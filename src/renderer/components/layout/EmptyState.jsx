import React from "react";
import { UI_TEXT } from "../../constants/messages";
import { IconDeviceGamepad2 } from "@tabler/icons-react";

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-card">
        <div className="empty-icon-wrap">
          <IconDeviceGamepad2 size={48} stroke={1.2} />
        </div>
        <h3 className="empty-title">{UI_TEXT.NO_COLLECTIONS_TITLE}</h3>
        <p className="empty-message">{UI_TEXT.NO_COLLECTIONS_MESSAGE}</p>
      </div>
    </div>
  );
}

export default EmptyState;
