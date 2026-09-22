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
    // 2_500_000 bytes → ~2.4 MB (base-1024 steps, conventional MB/KB labels — the
    // same convention `comments.attachments.errorTooLarge` renders).
    expect(screen.getByText('2.4 MB')).toBeInTheDocument();
  });

  test('renders a non-http(s) URL as a non-interactive unavailable chip', () => {
    const unsafe: MessageAttachment = { ...file, id: 'att-unsafe', url: 'javascript:alert(1)' };
    render(<MessageAttachments attachments={[unsafe]} />);
    // No link or image is rendered for an unsafe URL.
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    // There is nothing to click, so the hint must not tell the user to download.
    expect(screen.getByText('messageAttachments.unavailableNoDownload')).toBeInTheDocument();
    expect(screen.queryByText('messageAttachments.unavailableHint')).not.toBeInTheDocument();
  });

  // An *image* with an unsafe URL takes the AttachmentImage fallback, which
  // passes the download-oriented hint explicitly. The chip is still
  // non-interactive, so that hint must not win.
  test('a non-http(s) image falls back to a chip that does not offer a download', () => {
    const unsafeImage: MessageAttachment = { ...image, id: 'att-unsafe-img', url: 'javascript:alert(1)' };
    render(<MessageAttachments attachments={[unsafeImage]} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('messageAttachments.unavailableNoDownload')).toBeInTheDocument();
    expect(screen.queryByText('messageAttachments.unavailableHint')).not.toBeInTheDocument();
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

  test('recovers from an error state when the attachment URL changes (re-home, FR-017)', () => {
    const { rerender } = render(<MessageAttachments attachments={[image]} />);
    const img = screen.getByRole('img', { name: `messageAttachments.imageAlt:${image.displayName}` });
    fireEvent.error(img);
    // Errored → fallback chip, no image.
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('messageAttachments.unavailableHint')).toBeInTheDocument();

    // The document is re-homed: same id, fresh URL. The component must retry.
    const rehomed: MessageAttachment = { ...image, url: 'https://alkem.io/storage/document/img-1-rehomed' };
    rerender(<MessageAttachments attachments={[rehomed]} />);

    const retried = screen.getByRole('img', { name: `messageAttachments.imageAlt:${image.displayName}` });
    expect(retried).toHaveAttribute('src', rehomed.url);
    expect(screen.queryByText('messageAttachments.unavailableHint')).not.toBeInTheDocument();
  });

  test('shows a loading status until the image fires onLoad', () => {
    render(<MessageAttachments attachments={[image]} />);
    expect(screen.getByRole('status', { name: 'messageAttachments.loading' })).toBeInTheDocument();
    fireEvent.load(screen.getByRole('img', { name: `messageAttachments.imageAlt:${image.displayName}` }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  // Regression guard: the image used to be `display: none` (Tailwind `hidden`)
  // until it fired onLoad. A `loading="lazy"` image that is not in the layout is
  // never intersected by the browser's lazy-load observer, so it never fetches,
  // onLoad never fires, and the skeleton is permanent — i.e. NO attachment image
  // ever rendered. It must stay in the layout and merely be transparent.
  test('keeps the lazily-loaded image in the layout while it loads (never display:none)', () => {
    render(<MessageAttachments attachments={[image]} />);
    const img = screen.getByRole('img', { name: `messageAttachments.imageAlt:${image.displayName}` });

    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).not.toHaveClass('hidden');
    expect(img.style.display).not.toBe('none');
  });
});

test('an unavailable event keeps its filename without a fabricated document URL', () => {
  render(<MessageAttachments attachments={[{ displayName: 'unavailable.png' }]} />);
  expect(screen.getByText('unavailable.png')).toBeInTheDocument();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});
