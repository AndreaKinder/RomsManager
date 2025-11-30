import React from 'react';

function FormInput({ label, type = 'text', name, value, onChange, placeholder, required = false, min, max }) {
  return (
    <div className="form-group">
      <label className="nes-text">{label}</label>
      <input
        type={type}
        className="nes-input"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
      />
    </div>
  );
}

export default FormInput;
