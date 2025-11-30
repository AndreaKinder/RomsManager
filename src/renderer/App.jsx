import React, { useState, useEffect } from 'react';
import 'nes.css/css/nes.min.css';
import './App.css';
import RomsList from './components/RomsList';
import AddRomForm from './components/AddRomForm';

function App() {
  const [roms, setRoms] = useState([]);
  const [activeView, setActiveView] = useState('list');

  useEffect(() => {
    loadRoms();
  }, []);

  const loadRoms = async () => {
    const allRoms = await window.electronAPI.getAllRoms();
    setRoms(allRoms);
  };

  const handleAddRom = async (romData) => {
    await window.electronAPI.createRom(romData);
    await loadRoms();
    setActiveView('list');
  };

  const handleDeleteRom = async (id) => {
    await window.electronAPI.deleteRom(id);
    await loadRoms();
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
            onClick={() => setActiveView('list')}
          >
            My ROMs
          </button>
          <button
            className={`nes-btn ${activeView === 'add' ? 'is-success' : ''}`}
            onClick={() => setActiveView('add')}
          >
            + Add ROM
          </button>
        </div>
      </header>

      <main className="app-content">
        {activeView === 'list' && (
          <RomsList roms={roms} onDelete={handleDeleteRom} />
        )}
        {activeView === 'add' && (
          <AddRomForm onSubmit={handleAddRom} onCancel={() => setActiveView('list')} />
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
