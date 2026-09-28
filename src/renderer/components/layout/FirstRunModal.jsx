import React, { useState, useEffect } from "react";
import {
  IconDeviceDesktop,
  IconUsb,
  IconDeviceGamepad2,
  IconFolder,
  IconCheck,
} from "@tabler/icons-react";

function FirstRunModal({ onComplete }) {
  const [storageType, setStorageType] = useState("internal");
  const [selectedPath, setSelectedPath] = useState("");
  const [defaultInternalPath, setDefaultInternalPath] = useState("");
  const [syncEmulationStation, setSyncEmulationStation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const defaultPath =
          await window.electronAPI.getDefaultInternalPath?.();
        const existingPath = await window.electronAPI.getRomsBasePath?.();
        const existingType = await window.electronAPI.getStorageType?.();
        const existingEs =
          await window.electronAPI.getSyncEmulationStation?.();

        if (defaultPath) {
          setDefaultInternalPath(defaultPath);
        }

        if (existingType) {
          setStorageType(existingType);
        }

        if (existingEs !== undefined && existingEs !== null) {
          setSyncEmulationStation(Boolean(existingEs));
        }

        if (existingPath) {
          setSelectedPath(existingPath);
        } else if (defaultPath) {
          setSelectedPath(defaultPath);
        }
      } catch (err) {
        console.error("Error initializing first run config:", err);
      }
    })();
  }, []);

  const handleSelectStorageType = (type) => {
    setStorageType(type);
    if (type === "internal") {
      if (!selectedPath || selectedPath !== defaultInternalPath) {
        setSelectedPath(defaultInternalPath);
      }
    } else if (type === "external") {
      if (selectedPath === defaultInternalPath) {
        setSelectedPath("");
      }
    }
  };

  const handleSelectFolder = async () => {
    const folderPath = await window.electronAPI.selectRomsFolder();
    if (folderPath) {
      setSelectedPath(folderPath);
    }
  };

  const handleConfirm = async () => {
    if (!selectedPath.trim()) {
      alert(
        storageType === "external"
          ? "Por favor seleccioná la carpeta en tu disco externo donde guardarás los datos"
          : "Por favor seleccioná una carpeta para tus ROMs",
      );
      return;
    }

    setIsLoading(true);
    try {
      await window.electronAPI.setAppConfig({
        storageType,
        romsBasePath: selectedPath.trim(),
        syncEmulationStation,
      });
      onComplete();
    } catch (error) {
      console.error("Error al guardar la configuración:", error);
      alert("Error al guardar la configuración: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>
              Configuración Inicial
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
              Elige dónde almacenar tus juegos y configura la sincronización.
            </p>
          </div>
        </div>

        <div className="modal-body">
          {/* Paso 1: Tipo de almacenamiento */}
          <div className="form-field" style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
              1. ¿Dónde se guardarán tus datos y juegos?
            </label>

            <div className="storage-options-grid">
              <div
                className={`storage-card ${storageType === "internal" ? "selected" : ""}`}
                onClick={() => handleSelectStorageType("internal")}
              >
                <div className="storage-card-icon">
                  <IconDeviceDesktop size={22} />
                </div>
                <div className="storage-card-title">
                  Disco Interno
                  {storageType === "internal" && (
                    <IconCheck size={16} color="var(--primary-color)" />
                  )}
                </div>
                <div className="storage-card-desc">
                  Guarda tus ROMs en este ordenador y la base de datos en tu
                  usuario local. Ideal si juegas principalmente aquí.
                </div>
              </div>

              <div
                className={`storage-card ${storageType === "external" ? "selected" : ""}`}
                onClick={() => handleSelectStorageType("external")}
              >
                <div className="storage-card-icon">
                  <IconUsb size={22} />
                </div>
                <div className="storage-card-title">
                  Disco Externo / SD
                  {storageType === "external" && (
                    <IconCheck size={16} color="var(--primary-color)" />
                  )}
                </div>
                <div className="storage-card-desc">
                  Guarda las ROMs y la base de datos en una unidad externa o
                  tarjeta SD para que sea 100% portátil entre dispositivos.
                </div>
              </div>
            </div>
          </div>

          {/* Ruta seleccionada */}
          <div className="form-field" style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>
              {storageType === "internal"
                ? "Ruta en disco interno:"
                : "Ruta en disco externo / tarjeta SD:"}
            </label>
            <div className="collection-input-container">
              <input
                type="text"
                value={selectedPath}
                readOnly
                placeholder={
                  storageType === "external"
                    ? "Selecciona la carpeta en tu unidad externa..."
                    : "Ninguna carpeta seleccionada"
                }
                style={{ cursor: "default" }}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSelectFolder}
                disabled={isLoading}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <IconFolder size={16} />
                Explorar
              </button>
            </div>
            {selectedPath && (
              <p className="form-hint" style={{ marginTop: 8 }}>
                Estructura de carpetas:{" "}
                <strong>{selectedPath}/Roms</strong>
                {storageType === "external" && (
                  <span>
                    {" "}
                    y base de datos en{" "}
                    <strong>{selectedPath}/database</strong>
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Paso 2: Sincronización con Emulation Station */}
          <div className="form-field">
            <label style={{ fontSize: 13, fontWeight: 600 }}>
              2. Sincronización con Emulation Station
            </label>

            <div
              className={`sync-switch-card ${syncEmulationStation ? "active" : ""}`}
              onClick={() => setSyncEmulationStation(!syncEmulationStation)}
            >
              <div className="sync-switch-info">
                <div className="sync-switch-header">
                  <IconDeviceGamepad2
                    size={20}
                    color={
                      syncEmulationStation
                        ? "var(--success-color)"
                        : "var(--text-secondary)"
                    }
                  />
                  <span>Sincronizar con Emulation Station</span>
                  {syncEmulationStation && (
                    <span className="sync-feedback-badge">Activado</span>
                  )}
                </div>
                <div className="sync-switch-desc">
                  Genera y mantiene actualizados los archivos{" "}
                  <code>gamelist.xml</code> y carátulas en cada carpeta de
                  consola para Emulation Station, ES-DE, Batocera y RetroPie.
                </div>
              </div>

              <label
                className="custom-toggle"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={syncEmulationStation}
                  onChange={(e) => setSyncEmulationStation(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={isLoading || !selectedPath.trim()}
            style={{ minWidth: 140 }}
          >
            {isLoading ? "Configurando..." : "Comenzar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FirstRunModal;
