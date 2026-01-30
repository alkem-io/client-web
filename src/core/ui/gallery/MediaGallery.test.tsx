import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import MediaGallery from './MediaGallery';
import { MediaGalleryItem } from './types';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

const mockItems: MediaGalleryItem[] = [
  {
    id: '1',
    type: 'image',
    url: 'https://example.com/image1.jpg',
    title: 'Image 1',
  },
  {
    id: '2',
    type: 'video',
    url: 'https://example.com/video1.mp4',
    title: 'Video 1',
  },
];

describe('MediaGallery', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders gallery items correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <MediaGallery items={mockItems} />
      </ThemeProvider>
    );

    expect(screen.getByAltText('Image 1')).toBeInTheDocument();
    expect(screen.getByAltText('Video 1')).toBeInTheDocument();
  });

  it('opens lightbox on item click', () => {
    render(
      <ThemeProvider theme={theme}>
        <MediaGallery items={mockItems} />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByAltText('Image 1'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Image 1' })).toBeInTheDocument();
  });
});
