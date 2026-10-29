import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { CalloutMediaGalleryCarousel, shouldDragCarousel } from './CalloutMediaGalleryCarousel';

const emblaOptions = vi.hoisted(() => ({ last: undefined as unknown }));
vi.mock('embla-carousel-react', async importOriginal => {
  const actual = await importOriginal<typeof import('embla-carousel-react')>();
  return {
    ...actual,
    default: (options: unknown, plugins: unknown) => {
      emblaOptions.last = options;
      return actual.default(options as never, plugins as never);
    },
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { index?: number }) => (opts?.index ? `${key}:${opts.index}` : key),
  }),
}));

// Embla observes slide visibility; jsdom has no IntersectionObserver.
if (!('IntersectionObserver' in globalThis)) {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}

describe('CalloutMediaGalleryCarousel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('pauses a video once the carousel moves off its slide', async () => {
    const paused: string[] = [];
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLMediaElement) {
      paused.push(this.getAttribute('aria-label') ?? '');
    });

    const { container } = render(
      <CalloutMediaGalleryCarousel
        items={[
          { id: 'v1', uri: 'https://alkem.io/v1.mp4', kind: 'video', alternativeText: 'first' },
          { id: 'v2', uri: 'https://alkem.io/v2.mp4', kind: 'video', alternativeText: 'second' },
        ]}
        onDownload={vi.fn()}
      />
    );
    expect(container.querySelectorAll('video')).toHaveLength(2);
    // Let Embla initialise and hand its api to the component.
    await act(async () => {});

    await userEvent.click(screen.getByRole('tab', { name: 'mediaGallery.goToVideo:2' }));

    expect(paused).toContain('first');
    expect(paused).not.toContain('second');
  });

  const mixed = [
    { id: 'i1', uri: 'https://alkem.io/i1.png', alternativeText: 'picture' },
    { id: 'v1', uri: 'https://alkem.io/v1.mp4', kind: 'video' as const, alternativeText: 'clip' },
  ];

  test('arrow keys on a focused video seek it instead of changing the slide', async () => {
    render(<CalloutMediaGalleryCarousel items={mixed} initialIndex={1} onDownload={vi.fn()} />);
    await act(async () => {});
    const player = screen.getByLabelText('clip');
    expect(screen.getByRole('tab', { name: 'mediaGallery.goToVideo:2' })).toHaveAttribute('aria-selected', 'true');

    player.focus();
    const event = fireEvent.keyDown(player, { key: 'ArrowRight' });
    await act(async () => {});

    expect(event).toBe(true); // not default-prevented: the native control keeps the key
    expect(screen.getByRole('tab', { name: 'mediaGallery.goToVideo:2' })).toHaveAttribute('aria-selected', 'true');
  });

  test('arrow keys elsewhere in the gallery still change the slide', async () => {
    render(<CalloutMediaGalleryCarousel items={mixed} onDownload={vi.fn()} />);
    await act(async () => {});

    fireEvent.keyDown(screen.getByRole('tab', { name: 'mediaGallery.goToImage:1' }), { key: 'ArrowRight' });
    await act(async () => {});

    expect(screen.getByRole('tab', { name: 'mediaGallery.goToVideo:2' })).toHaveAttribute('aria-selected', 'true');
  });

  test('a pointer drag that starts on a video is left to the video, not the carousel', () => {
    render(<CalloutMediaGalleryCarousel items={mixed} onDownload={vi.fn()} />);
    expect((emblaOptions.last as { watchDrag?: unknown }).watchDrag).toBe(shouldDragCarousel);

    const onVideo = new MouseEvent('mousedown');
    Object.defineProperty(onVideo, 'target', { value: screen.getByLabelText('clip') });
    const onImage = new MouseEvent('mousedown');
    Object.defineProperty(onImage, 'target', { value: screen.getByRole('img', { name: 'picture' }) });

    expect(shouldDragCarousel(undefined, onVideo)).toBe(false);
    expect(shouldDragCarousel(undefined, onImage)).toBe(true);
  });

  test('video slides use video wording for their download and thumbnail labels', async () => {
    const onDownload = vi.fn();
    render(<CalloutMediaGalleryCarousel items={mixed} onDownload={onDownload} />);
    await act(async () => {});
    expect(screen.getByRole('button', { name: 'mediaGallery.download' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'mediaGallery.goToImage:1' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'mediaGallery.goToVideo:2' }));
    await userEvent.click(screen.getByRole('button', { name: 'mediaGallery.downloadVideo' }));

    expect(onDownload).toHaveBeenCalledWith(mixed[1]);
  });
});
