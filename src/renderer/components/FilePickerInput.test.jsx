import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FilePickerInput from './FilePickerInput';

describe('FilePickerInput', () => {
  test('renders with label and readonly input', () => {
    render(
      <FilePickerInput
        label="ROM File"
        value=""
        onFilePick={() => {}}
      />
    );

    expect(screen.getByText('ROM File')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Select a ROM file...')).toBeInTheDocument();
  });

  test('displays file path when provided', () => {
    const filePath = 'C:\\ROMs\\game.nes';
    render(
      <FilePickerInput
        label="ROM File"
        value={filePath}
        onFilePick={() => {}}
      />
    );

    expect(screen.getByDisplayValue(filePath)).toBeInTheDocument();
  });

  test('calls onFilePick when Browse button is clicked', () => {
    const handleFilePick = jest.fn();
    render(
      <FilePickerInput
        label="ROM File"
        value=""
        onFilePick={handleFilePick}
      />
    );

    const browseButton = screen.getByText('Browse');
    fireEvent.click(browseButton);

    expect(handleFilePick).toHaveBeenCalledTimes(1);
  });

  test('input is readonly', () => {
    render(
      <FilePickerInput
        label="ROM File"
        value="test.rom"
        onFilePick={() => {}}
      />
    );

    const input = screen.getByDisplayValue('test.rom');
    expect(input).toHaveAttribute('readonly');
  });
});
