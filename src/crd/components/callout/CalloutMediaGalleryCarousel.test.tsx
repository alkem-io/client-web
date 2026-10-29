import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { CalloutMediaGalleryCarousel } from './CalloutMediaGalleryCarousel';

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
      />
    );
    expect(container.querySelectorAll('video')).toHaveLength(2);
    // Let Embla initialise and hand its api to the component.
    await act(async () => {});

    await userEvent.click(screen.getByRole('tab', { name: 'mediaGallery.goToImage:2' }));

    expect(paused).toContain('first');
    expect(paused).not.toContain('second');
  });
});
