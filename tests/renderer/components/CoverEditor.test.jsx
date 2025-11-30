import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CoverEditor from '../../../src/renderer/components/roms/CoverEditor';

describe('CoverEditor', () => {
  beforeEach(() => {
    window.electronAPI.selectCoverImage.mockClear();
  });

  test('renders "Add Cover" button when no cover exists', () => {
    render(
      <CoverEditor
        romId="123"
        currentCover={null}
        customCover={null}
        onCoverChange={() => {}}
      />
    );

    expect(screen.getByText('Add Cover')).toBeInTheDocument();
  });

  test('renders "Change Cover" button when cover exists', () => {
    render(
      <CoverEditor
        romId="123"
        currentCover="/path/to/cover.jpg"
        customCover={null}
        onCoverChange={() => {}}
      />
    );

    expect(screen.getByText('Change Cover')).toBeInTheDocument();
  });

  test('shows editor options when edit button is clicked', () => {
    render(
      <CoverEditor
        romId="123"
        currentCover={null}
        customCover={null}
        onCoverChange={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Add Cover'));

    expect(screen.getByText('Select Image')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('calls selectCoverImage when Select Image is clicked', async () => {
    window.electronAPI.selectCoverImage.mockResolvedValue('/new/cover.jpg');
    const handleCoverChange = jest.fn();

    render(
      <CoverEditor
        romId="123"
        currentCover={null}
        customCover={null}
        onCoverChange={handleCoverChange}
      />
    );

    fireEvent.click(screen.getByText('Add Cover'));
    fireEvent.click(screen.getByText('Select Image'));

    await waitFor(() => {
      expect(window.electronAPI.selectCoverImage).toHaveBeenCalled();
      expect(handleCoverChange).toHaveBeenCalledWith('123', '/new/cover.jpg');
    });
  });

  test('shows "Remove Custom" button when custom cover exists', () => {
    render(
      <CoverEditor
        romId="123"
        currentCover="/original.jpg"
        customCover="/custom.jpg"
        onCoverChange={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Change Cover'));

    expect(screen.getByText('Remove Custom')).toBeInTheDocument();
  });

  test('calls onCoverChange with null when removing custom cover', async () => {
    global.confirm = jest.fn(() => true);
    const handleCoverChange = jest.fn();

    render(
      <CoverEditor
        romId="123"
        currentCover="/original.jpg"
        customCover="/custom.jpg"
        onCoverChange={handleCoverChange}
      />
    );

    fireEvent.click(screen.getByText('Change Cover'));
    fireEvent.click(screen.getByText('Remove Custom'));

    expect(global.confirm).toHaveBeenCalledWith('Remove custom cover and restore original?');
    expect(handleCoverChange).toHaveBeenCalledWith('123', null);
  });

  test('does not remove cover when user cancels confirmation', () => {
    global.confirm = jest.fn(() => false);
    const handleCoverChange = jest.fn();

    render(
      <CoverEditor
        romId="123"
        currentCover="/original.jpg"
        customCover="/custom.jpg"
        onCoverChange={handleCoverChange}
      />
    );

    fireEvent.click(screen.getByText('Change Cover'));
    fireEvent.click(screen.getByText('Remove Custom'));

    expect(handleCoverChange).not.toHaveBeenCalled();
  });

  test('hides editor when Cancel is clicked', () => {
    render(
      <CoverEditor
        romId="123"
        currentCover={null}
        customCover={null}
        onCoverChange={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Add Cover'));
    expect(screen.getByText('Select Image')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Select Image')).not.toBeInTheDocument();
    expect(screen.getByText('Add Cover')).toBeInTheDocument();
  });
});
