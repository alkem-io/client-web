/**
 * T008 — Session-only anonymous language choice.
 *
 * The anonymous language offer is in-memory only — no browser storage is written,
 * regardless of cookie consent. The choice lives in React context for the current
 * session and is re-offered on the next visit.
 *
 * Invariants verified:
 *  1. Accepting sets the in-memory `anonymousChoice` (language + answered).
 *  2. `window.localStorage` contains NO `alkemio.languageOffer` key — ever.
 *  3. A fresh provider mount (new render tree) starts at {language: null, answered: false}.
 *  4. clearAnonymousChoice resets to initial state in-memory (no storage to purge).
 */
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const LANGUAGE_OFFER_STORAGE_KEY = 'alkemio.languageOffer';

const makeWrapper =
  (Provider: React.ComponentType<{ children: ReactNode }>) =>
  ({ children }: { children: ReactNode }) => <Provider>{children}</Provider>;

beforeEach(() => {
  window.localStorage.clear();
  vi.resetModules();
});

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

const getModule = () => import('./LanguageOfferContext');

describe('Session-only anonymous language choice (no localStorage)', () => {
  it('accepting a language updates in-memory choice but writes nothing to localStorage', async () => {
    const { LanguageOfferProvider, useLanguageOfferContext } = await getModule();

    const { result } = renderHook(() => useLanguageOfferContext(), {
      wrapper: makeWrapper(LanguageOfferProvider),
    });

    act(() => {
      result.current.setAnonymousChoice({ language: 'nl', answered: true });
    });

    // In-memory state updated
    expect(result.current.anonymousChoice.language).toBe('nl');
    expect(result.current.anonymousChoice.answered).toBe(true);
    // No localStorage write — ever
    expect(window.localStorage.getItem(LANGUAGE_OFFER_STORAGE_KEY)).toBeNull();
  });

  it('declining a language updates in-memory choice but writes nothing to localStorage', async () => {
    const { LanguageOfferProvider, useLanguageOfferContext } = await getModule();

    const { result } = renderHook(() => useLanguageOfferContext(), {
      wrapper: makeWrapper(LanguageOfferProvider),
    });

    act(() => {
      result.current.setAnonymousChoice({ language: null, answered: true });
    });

    expect(result.current.anonymousChoice.answered).toBe(true);
    expect(result.current.anonymousChoice.language).toBeNull();
    expect(window.localStorage.getItem(LANGUAGE_OFFER_STORAGE_KEY)).toBeNull();
  });

  it('a fresh provider mount always starts at {language: null, answered: false}', async () => {
    // Seed localStorage as if a previous implementation had written there
    window.localStorage.setItem(LANGUAGE_OFFER_STORAGE_KEY, JSON.stringify({ language: 'de', answered: true }));

    const { LanguageOfferProvider, useLanguageOfferContext } = await getModule();

    const { result } = renderHook(() => useLanguageOfferContext(), {
      wrapper: makeWrapper(LanguageOfferProvider),
    });

    // Nothing survives across sessions — fresh state always
    expect(result.current.anonymousChoice.language).toBeNull();
    expect(result.current.anonymousChoice.answered).toBe(false);
  });

  it('clearAnonymousChoice resets to initial state in-memory', async () => {
    const { LanguageOfferProvider, useLanguageOfferContext } = await getModule();

    const { result } = renderHook(() => useLanguageOfferContext(), {
      wrapper: makeWrapper(LanguageOfferProvider),
    });

    act(() => {
      result.current.setAnonymousChoice({ language: 'fr', answered: true });
    });
    expect(result.current.anonymousChoice.language).toBe('fr');

    act(() => {
      result.current.clearAnonymousChoice();
    });

    expect(result.current.anonymousChoice.language).toBeNull();
    expect(result.current.anonymousChoice.answered).toBe(false);
    // Still nothing in storage
    expect(window.localStorage.getItem(LANGUAGE_OFFER_STORAGE_KEY)).toBeNull();
  });

  it('no cookie consent at all → still no localStorage writes (session-only is unconditional)', async () => {
    const { LanguageOfferProvider, useLanguageOfferContext } = await getModule();

    const { result } = renderHook(() => useLanguageOfferContext(), {
      wrapper: makeWrapper(LanguageOfferProvider),
    });

    act(() => {
      result.current.setAnonymousChoice({ language: 'es', answered: true });
    });

    expect(result.current.anonymousChoice.language).toBe('es');
    expect(window.localStorage.getItem(LANGUAGE_OFFER_STORAGE_KEY)).toBeNull();
  });
});
