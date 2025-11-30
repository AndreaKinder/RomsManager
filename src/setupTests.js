import "@testing-library/jest-dom";

// Mock window.electronAPI
global.window.electronAPI = {
  getAllRoms: jest.fn(),
  getRom: jest.fn(),
  createRom: jest.fn(),
  updateRom: jest.fn(),
  deleteRom: jest.fn(),
  selectRomFile: jest.fn(),
  selectCoverImage: jest.fn(),
};
