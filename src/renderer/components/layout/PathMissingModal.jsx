import React from "react";

function PathMissingModal({ missingPath, onClose, onChangeRoute }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2>Carpeta no encontrada</h2>
        </div>

        <div className="modal-body">
          <p style={{ color: "var(--md-sys-color-on-surface-variant)", marginBottom: 12 }}>
            La carpeta de ROMs configurada ya no existe:
          </p>
          <div
            className="error-message"
            style={{
              fontFamily: "monospace",
              fontSize: 13,
              wordBreak: "break-all",
              marginBottom: 16,
              marginTop: 0,
            }}
          >
            {missingPath}
          </div>
          <p style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
            Podés cerrar la app o seleccionar una nueva ruta.
          </p>
        </div>

        <div className="modal-footer" style={{ gap: 12 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar app
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onChangeRoute}
          >
            Nueva ruta
          </button>
        </div>
      </div>
    </div>
  );
}

export default PathMissingModal;
