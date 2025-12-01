import React, { useState } from "react";
import syncConfig from "../../../back/data/sync.json";

function SyncModal({ isOpen, onClose, onSync }) {
    const [selectedSystem, setSelectedSystem] = useState(syncConfig.systems[0].id);
    const [drivePath, setDrivePath] = useState("");
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);

    if (!isOpen) return null;

    const handleBrowse = async () => {
        const path = await window.electronAPI.selectFolder();
        if (path) {
            setDrivePath(path);
        }
    };

    const handleSync = async () => {
        if (!drivePath) return;

        setIsSyncing(true);
        setSyncResult(null);

        try {
            const result = await onSync(selectedSystem, drivePath);
            setSyncResult(result);
        } catch (error) {
            setSyncResult({ success: false, error: error.message });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="nes-dialog is-dark is-rounded" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            minWidth: '400px',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)'
        }}>
            <form method="dialog">
                <h3 className="title">Sync ROMs</h3>

                <div className="content">
                    <div className="nes-field is-inline">
                        <label htmlFor="system_select">System</label>
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
                        <label htmlFor="drive_path">SD Card Path</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                id="drive_path"
                                className="nes-input"
                                value={drivePath}
                                readOnly
                                placeholder="Select drive..."
                            />
                            <button type="button" className="nes-btn" onClick={handleBrowse}>
                                ...
                            </button>
                        </div>
                    </div>

                    {isSyncing && (
                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <p>Syncing... Please wait.</p>
                            <progress className="nes-progress is-primary" value="50" max="100"></progress>
                        </div>
                    )}

                    {syncResult && (
                        <div className={`nes-text ${syncResult.success ? 'is-success' : 'is-error'}`} style={{ marginTop: '1rem' }}>
                            {syncResult.success
                                ? `Successfully synced ${syncResult.copied} ROMs!`
                                : `Error: ${syncResult.error || 'Unknown error'}`
                            }
                            {syncResult.errors && syncResult.errors.length > 0 && (
                                <ul className="nes-list is-disc" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                    {syncResult.errors.slice(0, 3).map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                    {syncResult.errors.length > 3 && <li>...and {syncResult.errors.length - 3} more</li>}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                <div className="dialog-menu" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" className="nes-btn" onClick={onClose}>
                        Close
                    </button>
                    <button
                        type="button"
                        className={`nes-btn ${!drivePath || isSyncing ? 'is-disabled' : 'is-primary'}`}
                        onClick={handleSync}
                        disabled={!drivePath || isSyncing}
                    >
                        Sync
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SyncModal;
