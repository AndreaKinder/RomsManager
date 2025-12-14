import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure PDF.js worker
// Use CDN worker that matches the installed pdfjs-dist version
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function ManualViewerModal({ manualPath, romTitle, onClose }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfData, setPdfData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setError(null);
        const result = await window.electronAPI.readPdfFile(manualPath);
        if (result.success) {
          // Convert array back to Uint8Array for react-pdf
          const uint8Array = new Uint8Array(result.data);
          setPdfData(uint8Array);
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError(err.message);
      }
    };

    if (manualPath) {
      loadPdf();
    }
  }, [manualPath]);

  const handleBackdropClick = (e) => {
    if (e.target.className === "manual-modal-backdrop") {
      onClose();
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  return (
    <div className="manual-modal-backdrop" onClick={handleBackdropClick}>
      <div className="manual-modal-content">
        <div className="manual-modal-header">
          <h2>Manual - {romTitle}</h2>
          <div className="manual-controls">
            <button
              className="manual-control-btn"
              onClick={zoomOut}
              title="Alejar"
              disabled={scale <= 0.5}
            >
              −
            </button>
            <button
              className="manual-control-btn"
              onClick={resetZoom}
              title="Restablecer zoom"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              className="manual-control-btn"
              onClick={zoomIn}
              title="Acercar"
              disabled={scale >= 3.0}
            >
              +
            </button>
            <span className="manual-page-info">
              Página {pageNumber} de {numPages || "?"}
            </span>
            <button
              className="manual-control-btn"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              title="Página anterior"
            >
              ◀
            </button>
            <button
              className="manual-control-btn"
              onClick={goToNextPage}
              disabled={pageNumber >= (numPages || 1)}
              title="Página siguiente"
            >
              ▶
            </button>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="manual-modal-body">
          {error ? (
            <div className="manual-error">
              Error al cargar el manual: {error}
            </div>
          ) : !pdfData ? (
            <div className="manual-loading">Cargando manual...</div>
          ) : (
            <Document
              file={{ data: pdfData }}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="manual-loading">Renderizando PDF...</div>
              }
              error={
                <div className="manual-error">
                  Error al cargar el manual. Verifica que el archivo existe.
                </div>
              }
            >
              <Page pageNumber={pageNumber} scale={scale} />
            </Document>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManualViewerModal;
