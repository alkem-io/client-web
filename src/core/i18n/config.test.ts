/**
 * T002 paired test: DL-10 / SC-001c / FR-004 / SC-005 — i18next detector must
 * not write to localStorage or cookies, and must NOT include navigator in its
 * detection order (navigator drives the OFFER only, never the display language).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// We must import config AFTER mocking window so the IIFE inside env.ts doesn't
// try to resolve window._env_ against an undefined global.
vi.mock('@/main/env', () => ({ env: {} }));

describe('i18n config — DL-10 detector retrofit (caches: [], order: [querystring] — navigator excluded)', () => {
  let _originalLocalStorage: Storage;

  beforeEach(() => {
    _originalLocalStorage = window.localStorage;
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('does not write i18nextLng to localStorage after a language change', async () => {
    // Import fresh after mocks are set up
    const i18n = (await import('./config')).default;
    await i18n.changeLanguage('nl');

    expect(window.localStorage.getItem('i18nextLng')).toBeNull();
  });

  it('does not write i18nextLng to document.cookie after a language change', async () => {
    const i18n = (await import('./config')).default;
    await i18n.changeLanguage('nl');

    expect(document.cookie).not.toContain('i18nextLng');
  });

  it('still resolves from querystring lng param via the detector', async () => {
    // Simulate a URL querystring ?lng=nl by stubbing the global location
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, search: '?lng=nl', href: 'http://localhost/?lng=nl' },
      writable: true,
      configurable: true,
    });

    // Re-import to trigger detector with the new search string
    vi.resetModules();
    vi.mock('@/main/env', () => ({ env: {} }));
    const i18nFresh = (await import('./config')).default;

    // Querystring detector must have detected 'nl' and set the active language accordingly.
    expect(i18nFresh.language).toBe('nl');

    Object.defineProperty(window, 'location', { value: originalLocation, writable: true, configurable: true });
  });

  it('does not use navigator to set the active display language at boot (FR-004 / SC-005 / DL-6)', async () => {
    // Simulate a Dutch browser — navigator must NOT influence i18n.language
    Object.defineProperty(navigator, 'languages', {
      value: ['nl-NL', 'nl'],
      configurable: true,
      writable: true,
    });

    vi.resetModules();
    vi.mock('@/main/env', () => ({ env: {} }));
    const i18nFresh = (await import('./config')).default;

    // After boot with a Dutch browser, the display language must be the fallback
    // ('en'), NOT 'nl' — navigator is excluded from detection.order so it cannot
    // silently set the display language for an anonymous visitor.
    expect(i18nFresh.language).toBe('en');

    // Restore navigator.languages
    Object.defineProperty(navigator, 'languages', {
      value: ['en-US', 'en'],
      configurable: true,
      writable: true,
    });
  });

  // Placed last: it changes the shared i18next singleton's language, which would
  // perturb the leftover-state assumptions of the resetModules tests above.
  it('syncs document.documentElement.lang with the active display language', async () => {
    const i18n = (await import('./config')).default;

    await i18n.changeLanguage('nl');
    expect(document.documentElement.lang).toBe('nl');

    await i18n.changeLanguage('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
