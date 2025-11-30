import React from 'react';

function FormActions({ onSubmit, onCancel, submitText = 'Submit', cancelText = 'Cancel' }) {
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

export default FormActions;
