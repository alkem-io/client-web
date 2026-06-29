import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { MessageAttachments } from './MessageAttachments';
import type { MessageAttachment } from './types';

// Mock react-i18next with a tiny interpolating `t` so assertions can match the
// attachment's display name inside aria-labels.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { name?: string }) => (opts?.name ? `${key}:${opts.name}` : key),
  }),
}));

const image: MessageAttachment = {
  id: 'att-img',
  url: 'https://alkem.io/storage/document/img-1',
  displayName: 'photo.jpg',
  mimeType: 'image/jpeg',
  size: 102400,
  width: 1920,
  height: 1080,
};

const file: MessageAttachment = {
  id: 'att-file',
  url: 'https://alkem.io/storage/document/doc-1',
  displayName: 'report.pdf',
  mimeType: 'application/pdf',
  size: 2_500_000,
};

describe('MessageAttachments', () => {
  test('renders nothing when there are no attachments', () => {
    const { container } = render(<MessageAttachments attachments={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders an image preview that links to the document URL', () => {
    render(<MessageAttachments attachments={[image]} />);
    const img = screen.getByRole('img', { name: `messageAttachments.imageAlt:${image.displayName}` });
    expect(img).toHaveAttribute('src', image.url);
    expect(img).toHaveAttribute('loading', 'lazy');
    // The image is wrapped in a link to the full document, opening in a new tab.
    const link = img.closest('a');
    expect(link).toHaveAttribute('href', image.url);
    expect(link).toHaveAttribute('target', '_blank');
  });

  test('renders a non-image attachment as a downloadable file chip with size', () => {
    render(<MessageAttachments attachments={[file]} />);
    const link = screen.getByRole('link', { name: `messageAttachments.download:${file.displayName}` });
    expect(link).toHaveAttribute('href', file.url);
    expect(link).toHaveAttribute('download', file.displayName);
    expect(screen.getByText(file.displayName)).toBeInTheDocument();
    // 2_500_000 bytes → ~2.4 MB
    expect(screen.getByText('2.4 MB')).toBeInTheDocument();
  });

  test('renders multiple attachments as a labelled list', () => {
    render(<MessageAttachments attachments={[image, file]} />);
    expect(screen.getByRole('list', { name: 'messageAttachments.listLabel' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  test('falls back to a download chip with an unavailable hint when an image fails to load', () => {
    render(<MessageAttachments attachments={[image]} />);
    const img = screen.getByRole('img', { name: `messageAttachments.imageAlt:${image.displayName}` });
    fireEvent.error(img);
    // Image is replaced by the downloadable chip carrying the unavailable hint.
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: `messageAttachments.download:${image.displayName}` })).toBeInTheDocument();
    expect(screen.getByText('messageAttachments.unavailableHint')).toBeInTheDocument();
  });

  test('shows a loading status until the image fires onLoad', () => {
    render(<MessageAttachments attachments={[image]} />);
    expect(screen.getByRole('status', { name: 'messageAttachments.loading' })).toBeInTheDocument();
    fireEvent.load(screen.getByRole('img', { name: `messageAttachments.imageAlt:${image.displayName}` }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
