import React from 'react';

function FormButtons({ onCancel, submitText = 'Submit', cancelText = 'Cancel' }) {
  return (
    <div className="form-actions">
      <button type="submit" className="nes-btn is-success">
        {submitText}
      </button>
      <button type="button" className="nes-btn" onClick={onCancel}>
        {cancelText}
      </button>
    </div>
  );
}

export default FormButtons;
