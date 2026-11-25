import React, { useState, useEffect, useCallback } from "react";
import {
  IconX,
  IconServer,
  IconDownload,
  IconCheck,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let idx = 0;
  let value = bytes;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx++;
  }
  return `${value.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

export default function RommBrowserModal({ onClose, onLibraryUpdated, onOpenSettings }) {
  const [config, setConfig] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatformId, setSelectedPlatformId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roms, setRoms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingMeta, setIsSyncingMeta] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  const loadRoms = useCallback(async (platformId, search) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await window.electronAPI.rommGetRoms({
        platformId: platformId || null,
        search: search || "",
        limit: 100,
      });
      if (res.success) {
        setRoms(res.roms || []);
      } else {
        setError(res.error || "No se pudieron cargar las ROMs de RomM.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let unsubscribe = null;
    if (window.electronAPI.onRommDownloadProgress) {
      unsubscribe = window.electronAPI.onRommDownloadProgress((prog) => {
        setDownloadProgress(prog.percent || 0);
      });
    }

    (async () => {
      try {
        const cfg = await window.electronAPI.rommGetConfig();
        setConfig(cfg);
        if (cfg?.enabled && cfg?.serverUrl) {
          const pRes = await window.electronAPI.rommGetPlatforms();
          if (pRes.success) {
            setPlatforms(pRes.platforms || []);
            const firstId = pRes.platforms?.[0]?.id || "";
            setSelectedPlatformId(String(firstId));
            await loadRoms(firstId, "");
          } else {
            setError(pRes.error || "No se pudo conectar con RomM.");
          }
        }
      } catch (err) {
        setError(err.message);
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadRoms]);

  const handlePlatformChange = async (e) => {
    const val = e.target.value;
    setSelectedPlatformId(val);
    await loadRoms(val ? Number(val) : null, searchTerm);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await loadRoms(selectedPlatformId ? Number(selectedPlatformId) : null, searchTerm);
  };

  const handleDownload = async (rom) => {
    setDownloadingId(rom.id);
    setDownloadProgress(0);
    setError(null);
    setFeedback(null);
    try {
      const res = await window.electronAPI.rommDownloadRom(rom, rom.consoleId);
      if (res.success) {
        setRoms((prev) =>
          prev.map((item) =>
            item.id === rom.id ? { ...item, isDownloaded: true } : item,
          ),
        );
        setFeedback(`Descargada "${rom.name}" en ${rom.consoleId.toUpperCase()}.`);
        if (onLibraryUpdated) await onLibraryUpdated();
      } else {
        setError(res.error || "Error al descargar la ROM.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadingId(null);
      setDownloadProgress(0);
    }
  };

  const handleSyncMetadata = async () => {
    setIsSyncingMeta(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await window.electronAPI.rommSyncMetadata();
      if (res.success) {
        setFeedback(
          `Metadatos sincronizados: ${res.matched} juegos emparejados, ${res.coversDownloaded} carátulas descargadas.`,
        );
        if (onLibraryUpdated) await onLibraryUpdated();
      } else {
        setError(res.error || "Error al sincronizar metadatos.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSyncingMeta(false);
    }
  };

  const isConfigured = Boolean(config?.enabled && config?.serverUrl);

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target.className === "modal-backdrop") onClose();
      }}
    >
      <div
        className="modal-content"
        style={{ maxWidth: 820, width: "92%", maxHeight: "85vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconServer size={20} />
            Catálogo RomM
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
          {!isConfigured ? (
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <p style={{ marginBottom: 12 }}>
                La integración con RomM no está activada todavía.
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 16 }}>
                Configura la URL de tu servidor RomM y tus credenciales en Ajustes para explorar y descargar tu catálogo.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  if (onOpenSettings) onOpenSettings();
                }}
              >
                Abrir Ajustes
              </button>
            </div>
          ) : (
            <>
              <form
                onSubmit={handleSearch}
                style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}
              >
                <select
                  value={selectedPlatformId}
                  onChange={handlePlatformChange}
                  style={{ minWidth: 180 }}
                >
                  <option value="">Todas las plataformas</option>
                  {platforms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.romCount})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar juego en RomM..."
                  style={{ flex: 1, minWidth: 160 }}
                />

                <button type="submit" className="btn btn-secondary" disabled={isLoading}>
                  <IconSearch size={16} />
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleSyncMetadata}
                  disabled={isSyncingMeta}
                  title="Sincronizar metadatos y carátulas de juegos locales desde RomM"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <IconRefresh size={16} className={isSyncingMeta ? "spin-animation" : ""} />
                  {isSyncingMeta ? "Sincronizando..." : "Sync metadatos"}
                </button>
              </form>

              {error && (
                <div style={{ color: "var(--danger-color, #ef4444)", fontSize: "0.85rem", marginBottom: 10 }}>
                  {error}
                </div>
              )}

              {feedback && (
                <div style={{ color: "var(--success-color)", fontSize: "0.85rem", marginBottom: 10 }}>
                  {feedback}
                </div>
              )}

              {isLoading ? (
                <p style={{ textAlign: "center", padding: 24, color: "var(--text-secondary)" }}>
                  Cargando catálogo desde {config.serverUrl}...
                </p>
              ) : roms.length === 0 ? (
                <p style={{ textAlign: "center", padding: 24, color: "var(--text-secondary)" }}>
                  No se encontraron juegos con ese filtro.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {roms.map((rom) => (
                    <div
                      key={rom.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "8px 12px",
                        borderRadius: 8,
                        background: "var(--surface)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{rom.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          {rom.platformName} → <code>{rom.consoleId}</code> · {rom.fileName}
                          {rom.fileSizeBytes ? ` · ${formatBytes(rom.fileSizeBytes)}` : ""}
                        </div>
                      </div>

                      {rom.isDownloaded ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: "0.8rem",
                            color: "var(--success-color)",
                            fontWeight: 600,
                          }}
                        >
                          <IconCheck size={16} />
                          Local
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => handleDownload(rom)}
                          disabled={downloadingId !== null}
                          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem" }}
                        >
                          <IconDownload size={14} />
                          {downloadingId === rom.id
                            ? `Descargando (${downloadProgress}%)`
                            : "Descargar"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
