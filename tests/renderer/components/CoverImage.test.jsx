import React from 'react';
import { render, screen } from '@testing-library/react';
import CoverImage from '../../../src/renderer/components/roms/CoverImage';

describe('CoverImage', () => {
  test('renders placeholder when no cover is provided', () => {
    render(<CoverImage coverPath={null} customCoverPath={null} title="Test Game" />);

    expect(screen.getByText('No Cover')).toBeInTheDocument();
  });

  test('renders cover image when coverPath is provided', () => {
    render(<CoverImage coverPath="/path/to/cover.jpg" customCoverPath={null} title="Test Game" />);

    const img = screen.getByAltText('Test Game cover');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/path/to/cover.jpg');
  });

  test('renders custom cover when customCoverPath is provided', () => {
    render(
      <CoverImage
        coverPath="/path/to/original.jpg"
        customCoverPath="/path/to/custom.jpg"
        title="Test Game"
      />
    );

    const img = screen.getByAltText('Test Game cover');
    expect(img).toHaveAttribute('src', '/path/to/custom.jpg');
  });

  test('shows custom badge when custom cover is used', () => {
    const { container } = render(
      <CoverImage
        coverPath="/path/to/original.jpg"
        customCoverPath="/path/to/custom.jpg"
        title="Test Game"
      />
    );

    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  test('does not show custom badge with original cover', () => {
    render(<CoverImage coverPath="/path/to/cover.jpg" customCoverPath={null} title="Test Game" />);

    expect(screen.queryByText('Custom')).not.toBeInTheDocument();
  });
});
