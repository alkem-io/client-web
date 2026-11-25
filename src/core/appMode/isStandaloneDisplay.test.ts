import { afterEach, describe, expect, it, vi } from 'vitest';
import { isStandaloneDisplay } from './isStandaloneDisplay';

const mockDisplayMode = (standalone: boolean) =>
  vi
    .spyOn(window, 'matchMedia')
    .mockImplementation(
      query => ({ matches: standalone && query === '(display-mode: standalone)', media: query }) as MediaQueryList
    );

describe('isStandaloneDisplay', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(navigator, 'standalone');
  });

  it('is false in a plain browser tab', () => {
    mockDisplayMode(false);

    expect(isStandaloneDisplay()).toBe(false);
  });

  it('is true in the installed PWA (display-mode: standalone)', () => {
    mockDisplayMode(true);

    expect(isStandaloneDisplay()).toBe(true);
  });

  it('is true in an iOS home-screen app (navigator.standalone)', () => {
    mockDisplayMode(false);
    Object.defineProperty(navigator, 'standalone', { value: true, configurable: true });

    expect(isStandaloneDisplay()).toBe(true);
  });
});
