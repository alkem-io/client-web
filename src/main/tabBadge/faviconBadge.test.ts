import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * jsdom never fires `img.onload` (it does not fetch subresources) and has no canvas
 * implementation, so the real module is inert under test unless both are stubbed.
 * We stub them here and drive the image load by hand — which is what makes the
 * async-race assertions below possible at all.
 */

const BADGED_DATA_URL = 'data:image/png;base64,BADGED';

/** Every FakeImage constructed by the module under test, in order. */
let images: FakeImage[] = [];

class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  complete = false;
  naturalWidth = 0;
  private _src = '';

  constructor() {
    images.push(this);
  }

  set src(value: string) {
    this._src = value;
  }
  get src(): string {
    return this._src;
  }

  /** Simulate the browser finishing the decode. */
  fireLoad(): void {
    this.complete = true;
    this.naturalWidth = SIZE;
    this.onload?.();
  }

  /** Simulate the base icon failing to load (blocked, network error, CSP). */
  fireError(): void {
    this.onerror?.();
  }
}

const SIZE = 32;
const fillText = vi.fn();

const iconLinks = () => Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'));
const iconHrefs = () => iconLinks().map(link => link.getAttribute('href'));

let faviconBadge: typeof import('./faviconBadge');

beforeEach(async () => {
  images = [];
  fillText.mockClear();

  // index.html declares three icon candidates — this is the shape that matters.
  document.head.innerHTML = `
    <link rel="icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  `;

  vi.stubGlobal('Image', FakeImage);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    drawImage: vi.fn(),
    fillText,
    fillStyle: '',
    font: '',
    textAlign: '',
    textBaseline: '',
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(BADGED_DATA_URL);

  // The module holds generation/link state at module scope — reset it per test.
  vi.resetModules();
  faviconBadge = await import('./faviconBadge');
});

describe('setFaviconBadge', () => {
  it('replaces ALL icon candidates with a single sizeless badged link', () => {
    faviconBadge.setFaviconBadge(3);
    images[0].fireLoad();

    const links = iconLinks();
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe(BADGED_DATA_URL);
    // The regression that matters: a surviving 16x16 candidate is what a 1x display
    // would actually render, leaving the badge invisible.
    expect(links[0].hasAttribute('sizes')).toBe(false);
    expect(iconHrefs()).not.toContain('/favicon-16x16.png');
  });

  it('draws the count, clamping above 99', () => {
    faviconBadge.setFaviconBadge(7);
    images[0].fireLoad();
    expect(fillText).toHaveBeenCalledWith('7', expect.any(Number), expect.any(Number));

    fillText.mockClear();
    faviconBadge.setFaviconBadge(150);
    expect(fillText).toHaveBeenCalledWith('99+', expect.any(Number), expect.any(Number));
  });

  it('redraws synchronously once the base image is decoded (no reload)', () => {
    faviconBadge.setFaviconBadge(1);
    images[0].fireLoad();
    expect(images).toHaveLength(1);

    faviconBadge.setFaviconBadge(2);

    expect(images).toHaveLength(1); // reused, not reconstructed
    expect(fillText).toHaveBeenLastCalledWith('2', expect.any(Number), expect.any(Number));
  });

  it('does not throw when the 2D context is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    expect(() => {
      faviconBadge.setFaviconBadge(1);
      images[0].fireLoad();
    }).not.toThrow();
  });

  it('restores the original icons when the base image fails to load', () => {
    faviconBadge.setFaviconBadge(1); // detaches the originals, starts the async load…
    expect(iconLinks()).toHaveLength(1); // originals already removed, badge link has no href yet

    images[0].fireError(); // …the base icon never arrives

    // Without the onerror handler the tab would be left with a single href-less
    // link — a blank favicon. Recovery re-attaches the originals instead.
    expect(fillText).not.toHaveBeenCalled();
    expect(iconHrefs()).toEqual(['/favicon.ico', '/favicon-32x32.png', '/favicon-16x16.png']);
    expect(iconHrefs()).not.toContain(BADGED_DATA_URL);
  });

  it('ignores a load failure that has already been superseded', () => {
    faviconBadge.setFaviconBadge(1); // starts an async load…
    faviconBadge.clearFaviconBadge(); // …superseded before it resolves

    expect(() => images[0].fireError()).not.toThrow();
    // The generation guard drops the stale error; the clear already restored icons.
    expect(iconHrefs()).toEqual(['/favicon.ico', '/favicon-32x32.png', '/favicon-16x16.png']);
  });

  it('does not throw when canvas export is blocked (tainted canvas)', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(() => {
      faviconBadge.setFaviconBadge(1);
      images[0].fireLoad();
    }).not.toThrow();
  });
});

describe('the async race', () => {
  it('a draw cancelled by a clear does no drawing at all', () => {
    faviconBadge.setFaviconBadge(1); // starts an async image load…
    faviconBadge.clearFaviconBadge(); // …user reads everything before it resolves

    images[0].fireLoad(); // the stale load finally lands

    // The generation guard drops the superseded draw outright. Asserting on the DOM
    // alone would NOT catch a missing guard (the badge link is detached by the clear,
    // so a stale draw would scribble on an orphan node); asserting that no drawing
    // work happened is what actually pins the guard.
    expect(fillText).not.toHaveBeenCalled();

    // …and the real icons are intact.
    expect(iconHrefs()).toEqual(['/favicon.ico', '/favicon-32x32.png', '/favicon-16x16.png']);
    expect(iconHrefs()).not.toContain(BADGED_DATA_URL);
  });

  it('only the newest count is drawn when calls arrive before the image resolves', () => {
    faviconBadge.setFaviconBadge(1);
    faviconBadge.setFaviconBadge(5); // supersedes before the first resolves

    images[0].fireLoad();

    expect(fillText).toHaveBeenCalledTimes(1);
    expect(fillText).toHaveBeenCalledWith('5', expect.any(Number), expect.any(Number));
  });

  it('a clear cancels a pending draw even if a later badge re-arms it', () => {
    faviconBadge.setFaviconBadge(3);
    faviconBadge.clearFaviconBadge();
    images[0].fireLoad(); // stale — must be dropped
    expect(fillText).not.toHaveBeenCalled();

    faviconBadge.setFaviconBadge(2); // image is decoded now → synchronous redraw
    expect(fillText).toHaveBeenCalledTimes(1);
    expect(fillText).toHaveBeenCalledWith('2', expect.any(Number), expect.any(Number));
    expect(iconHrefs()).toEqual([BADGED_DATA_URL]);
  });
});

describe('clearFaviconBadge', () => {
  it('restores the original icon candidates in order', () => {
    faviconBadge.setFaviconBadge(4);
    images[0].fireLoad();
    expect(iconLinks()).toHaveLength(1);

    faviconBadge.clearFaviconBadge();

    expect(iconHrefs()).toEqual(['/favicon.ico', '/favicon-32x32.png', '/favicon-16x16.png']);
  });

  it('is a no-op when no badge was ever set', () => {
    expect(() => faviconBadge.clearFaviconBadge()).not.toThrow();
    expect(iconHrefs()).toEqual(['/favicon.ico', '/favicon-32x32.png', '/favicon-16x16.png']);
  });

  it('supports badge → clear → badge round trips', () => {
    faviconBadge.setFaviconBadge(1);
    images[0].fireLoad();
    faviconBadge.clearFaviconBadge();
    expect(iconLinks()).toHaveLength(3);

    faviconBadge.setFaviconBadge(2);

    const links = iconLinks();
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe(BADGED_DATA_URL);
  });
});
