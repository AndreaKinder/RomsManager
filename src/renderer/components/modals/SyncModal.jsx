import React, { useState } from "react";
import syncConfig from "../../../back/data/sync.json";

function SyncModal({ isOpen, onClose, onSync }) {
    const [selectedSystem, setSelectedSystem] = useState(syncConfig.systems[0].id);
    const [drivePath, setDrivePath] = useState("");
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const [currentOperation, setCurrentOperation] = useState(null);

    if (!isOpen) return null;

    const handleBrowse = async () => {
        const path = await window.electronAPI.selectFolder();
        if (path) {
            setDrivePath(path);
        }
    };

    const handleExport = async () => {
        if (!drivePath) return;

        setIsSyncing(true);
        setSyncResult(null);
        setCurrentOperation("export");

        try {
            const result = await window.electronAPI.exportToSD({ systemId: selectedSystem, drivePath });
            setSyncResult(result);
        } catch (error) {
            setSyncResult({ success: false, error: error.message });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleImport = async () => {
        if (!drivePath) return;

        setIsSyncing(true);
        setSyncResult(null);
        setCurrentOperation("import");

        try {
            const result = await window.electronAPI.importFromSD({ systemId: selectedSystem, drivePath });
            setSyncResult(result);
        } catch (error) {
            setSyncResult({ success: false, error: error.message });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSync = async () => {
        if (!drivePath) return;

        setIsSyncing(true);
        setSyncResult(null);
        setCurrentOperation("sync");

        try {
            const result = await onSync(selectedSystem, drivePath);
            setSyncResult(result);
        } catch (error) {
            setSyncResult({ success: false, error: error.message });
        } finally {
            setIsSyncing(false);
        }
    };

    const renderResult = () => {
        if (!syncResult) return null;

        if (!syncResult.success) {
            return (
                <div className="nes-text is-error" style={{ marginTop: '1rem' }}>
                    Error: {syncResult.error || 'Unknown error'}
                </div>
            );
        }

        if (currentOperation === "export") {
            return (
                <div className="nes-text is-success" style={{ marginTop: '1rem' }}>
                    <p>✓ Export completado!</p>
                    <ul style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        <li>ROMs copiadas: {syncResult.romsCopied || 0}</li>
                        <li>Carátulas copiadas: {syncResult.coversCopied || 0}</li>
                        <li>Metadatos exportados: {syncResult.metadataExported || 0} consolas</li>
                    </ul>
                    {syncResult.errors && syncResult.errors.length > 0 && (
                        <div>
                            <p style={{ marginTop: '0.5rem', color: '#f7d51d' }}>Advertencias:</p>
                            <ul className="nes-list is-disc" style={{ fontSize: '0.8rem' }}>
                                {syncResult.errors.slice(0, 3).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                                {syncResult.errors.length > 3 && <li>...y {syncResult.errors.length - 3} más</li>}
                            </ul>
                        </div>
                    )}
                </div>
            );
        }

        if (currentOperation === "import") {
            return (
                <div className="nes-text is-success" style={{ marginTop: '1rem' }}>
                    <p>✓ Import completado!</p>
                    <ul style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        <li>ROMs encontradas: {syncResult.romsFound || 0}</li>
                        <li>ROMs importadas: {syncResult.romsImported || 0}</li>
                        <li>Carátulas encontradas: {syncResult.coversFound || 0}</li>
                        <li>Metadatos importados: {syncResult.metadataImported || 0} consolas</li>
                    </ul>
                    {syncResult.errors && syncResult.errors.length > 0 && (
                        <div>
                            <p style={{ marginTop: '0.5rem', color: '#f7d51d' }}>Advertencias:</p>
                            <ul className="nes-list is-disc" style={{ fontSize: '0.8rem' }}>
                                {syncResult.errors.slice(0, 3).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                                {syncResult.errors.length > 3 && <li>...y {syncResult.errors.length - 3} más</li>}
                            </ul>
                        </div>
                    )}
                </div>
            );
        }

        if (currentOperation === "sync") {
            const exportData = syncResult.export || {};
            const importData = syncResult.import || {};

            return (
                <div className="nes-text is-success" style={{ marginTop: '1rem' }}>
                    <p>✓ Sincronización completada!</p>
                    <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        <p><strong>Export:</strong></p>
                        <ul style={{ marginLeft: '1rem' }}>
                            <li>ROMs: {exportData.romsCopied || 0}</li>
                            <li>Carátulas: {exportData.coversCopied || 0}</li>
                            <li>Metadatos: {exportData.metadataExported || 0} consolas</li>
                        </ul>
                        <p style={{ marginTop: '0.5rem' }}><strong>Import:</strong></p>
                        <ul style={{ marginLeft: '1rem' }}>
                            <li>ROMs encontradas: {importData.romsFound || 0}</li>
                            <li>ROMs importadas: {importData.romsImported || 0}</li>
                            <li>Carátulas encontradas: {importData.coversFound || 0}</li>
                            <li>Metadatos: {importData.metadataImported || 0} consolas</li>
                        </ul>
                    </div>
                    {(exportData.errors?.length > 0 || importData.errors?.length > 0) && (
                        <div>
                            <p style={{ marginTop: '0.5rem', color: '#f7d51d' }}>Advertencias:</p>
                            <ul className="nes-list is-disc" style={{ fontSize: '0.8rem' }}>
                                {[...(exportData.errors || []), ...(importData.errors || [])].slice(0, 3).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                                {([...(exportData.errors || []), ...(importData.errors || [])].length > 3) &&
                                    <li>...y más errores</li>
                                }
                            </ul>
                        </div>
                    )}
                </div>
            );
        }
    };

    return (
        <div className="nes-dialog is-dark is-rounded" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            minWidth: '500px',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)'
        }}>
            <form method="dialog">
                <h3 className="title">Sincronización de ROMs</h3>

                <div className="content">
                    <div className="nes-field is-inline">
                        <label htmlFor="system_select">Sistema</label>
                        <div className="nes-select">
                            <select
                                id="system_select"
                                value={selectedSystem}
                                onChange={(e) => setSelectedSystem(e.target.value)}
                            >
                                {syncConfig.systems.map(sys => (
                                    <option key={sys.id} value={sys.id}>{sys.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="nes-field" style={{ marginTop: '1rem' }}>
                        <label htmlFor="drive_path">Ruta de la SD</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                id="drive_path"
                                className="nes-input"
                                value={drivePath}
                                readOnly
                                placeholder="Seleccionar carpeta..."
                            />
                            <button type="button" className="nes-btn" onClick={handleBrowse}>
                                ...
                            </button>
                        </div>
                    </div>

                    {isSyncing && (
                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <p>
                                {currentOperation === "export" && "Exportando a SD..."}
                                {currentOperation === "import" && "Importando desde SD..."}
                                {currentOperation === "sync" && "Sincronizando (Export + Import)..."}
                            </p>
                            <progress className="nes-progress is-primary" value="50" max="100"></progress>
                        </div>
                    )}

                    {renderResult()}
                </div>

                <div className="dialog-menu" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <button type="button" className="nes-btn" onClick={onClose}>
                        Cerrar
                    </button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            className={`nes-btn ${!drivePath || isSyncing ? 'is-disabled' : 'is-success'}`}
                            onClick={handleExport}
                            disabled={!drivePath || isSyncing}
                            title="Exportar ROMs y carátulas a la SD"
                        >
                            Export
                        </button>
                        <button
                            type="button"
                            className={`nes-btn ${!drivePath || isSyncing ? 'is-disabled' : 'is-warning'}`}
                            onClick={handleImport}
                            disabled={!drivePath || isSyncing}
                            title="Importar ROMs y carátulas desde la SD"
                        >
                            Import
                        </button>
                        <button
                            type="button"
                            className={`nes-btn ${!drivePath || isSyncing ? 'is-disabled' : 'is-primary'}`}
                            onClick={handleSync}
                            disabled={!drivePath || isSyncing}
                            title="Sincronización bidireccional (Export + Import)"
                        >
                            Sync
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default SyncModal;
