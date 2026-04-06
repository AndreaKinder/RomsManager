import React from "react";

function PathMissingModal({ missingPath, onClose, onChangeRoute }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2>Carpeta no encontrada</h2>
        </div>

        <div className="modal-body">
          <p style={{ color: "var(--text-secondary)", marginBottom: 12 }}>
            La carpeta de ROMs configurada ya no existe:
          </p>
          <p
            style={{
              background: "var(--surface-light)",
              borderRadius: 6,
              padding: "8px 12px",
              fontFamily: "monospace",
              fontSize: 13,
              color: "var(--danger-color)",
              wordBreak: "break-all",
              marginBottom: 16,
            }}
          >
            {missingPath}
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
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
