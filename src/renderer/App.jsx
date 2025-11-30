import React, { useState, useEffect } from 'react';
import 'nes.css/css/nes.min.css';
import '../styles/index.css';
import RomsList from './components/roms/RomsList';
import AddRomForm from './components/forms/AddRomForm';

import EditRomForm from './components/forms/EditRomForm';

function App() {
  const [roms, setRoms] = useState([]);
  const [activeView, setActiveView] = useState('list');
  const [editingRom, setEditingRom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRoms();
  }, []);

  const loadRoms = async () => {
    setIsLoading(true);
    const allRoms = await window.electronAPI.getAllRoms();
    setRoms(allRoms);
    setIsLoading(false);
  };

  const handleAddRom = async (romData) => {
    setIsLoading(true);
    await window.electronAPI.createRom(romData);
    await loadRoms();
    setActiveView('list');
    setIsLoading(false);
  };

  const handleEditRom = async (id, updates) => {
    setIsLoading(true);
    await window.electronAPI.updateRom(id, updates);
    await loadRoms();
    setEditingRom(null);
    setActiveView('list');
    setIsLoading(false);
  };

  const handleDeleteRom = async (id) => {
    if (isLoading) return;
    setIsLoading(true);
    await window.electronAPI.deleteRom(id);
    await loadRoms();
    setIsLoading(false);
  };

  const handlePlayRom = async (filePath) => {
    const success = await window.electronAPI.openRom(filePath);
    if (!success) {
      alert("Could not open ROM file.");
    }
  };

  const startEditing = (rom) => {
    setEditingRom(rom);
    setActiveView('edit');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="nes-text is-primary">
          <i className="nes-icon trophy is-medium"></i>
          ROM Manager
        </h1>
        <div className="header-actions">
          <button
            className={`nes-btn ${activeView === 'list' ? 'is-primary' : ''}`}
            onClick={() => {
              setActiveView('list');
              setEditingRom(null);
            }}
          >
            My ROMs
          </button>
          <button
            className={`nes-btn ${activeView === 'add' ? 'is-success' : ''}`}
            onClick={() => {
              setActiveView('add');
              setEditingRom(null);
            }}
          >
            + Add ROM
          </button>
        </div>
      </header>

      <main className="app-content">
        {isLoading && <p>Loading...</p>}
        {!isLoading && activeView === 'list' && (
          <RomsList
            roms={roms}
            onDelete={handleDeleteRom}
            onEdit={startEditing}
            onPlay={handlePlayRom}
          />
        )}
        {!isLoading && activeView === 'add' && (
          <AddRomForm onSubmit={handleAddRom} onCancel={() => setActiveView('list')} />
        )}
        {!isLoading && activeView === 'edit' && editingRom && (
          <EditRomForm
            rom={editingRom}
            onSubmit={handleEditRom}
            onCancel={() => {
              setActiveView('list');
              setEditingRom(null);
            }}
          />
        )}
      </main>

      <footer className="app-footer">
        <p className="nes-text is-disabled">
          Total ROMs: {roms.length}
        </p>
      </footer>
    </div>
  );
}

export default App;
