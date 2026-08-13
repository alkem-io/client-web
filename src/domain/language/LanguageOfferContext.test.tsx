/**
 * T004 paired tests: LanguageOfferContext (session-only, no-storage)
 * - setAnonymousChoice updates in-memory state only — no localStorage writes
 * - clearAnonymousChoice resets in-memory to initial (no storage to purge)
 * - fresh mount always starts at {language:null, answered:false}
 */
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const LANGUAGE_OFFER_STORAGE_KEY = 'alkemio.languageOffer';

// Dynamic import so we can reset mocks between tests
const getModule = async () => {
  const mod = await import('./LanguageOfferContext');
  return mod;
};

beforeEach(() => {
  window.localStorage.clear();
  vi.resetModules();
});

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('LanguageOfferContext', () => {
  const wrapper =
    (Provider: React.ComponentType<{ children: ReactNode }>) =>
    ({ children }: { children: ReactNode }) => <Provider>{children}</Provider>;

  it('setAnonymousChoice updates in-memory state', async () => {
    const { LanguageOfferProvider, useLanguageOfferContext } = await getModule();

    const { result } = renderHook(() => useLanguageOfferContext(), { wrapper: wrapper(LanguageOfferProvider) });

    act(() => {
      result.current.setAnonymousChoice({ language: 'nl', answered: true });
    });

    expect(result.current.anonymousChoice.language).toBe('nl');
    expect(result.current.anonymousChoice.answered).toBe(true);
  });

  it('setAnonymousChoice does NOT write to localStorage (session-only)', async () => {
    const { LanguageOfferProvider, useLanguageOfferContext } = await getModule();

    const { result } = renderHook(() => useLanguageOfferContext(), { wrapper: wrapper(LanguageOfferProvider) });

    act(() => {
      result.current.setAnonymousChoice({ language: 'nl', answered: true });
    });

    expect(window.localStorage.getItem(LANGUAGE_OFFER_STORAGE_KEY)).toBeNull();
  });

  it('clearAnonymousChoice resets in-memory choice to initial state', async () => {
    const { LanguageOfferProvider, useLanguageOfferContext } = await getModule();

    const { result } = renderHook(() => useLanguageOfferContext(), { wrapper: wrapper(LanguageOfferProvider) });

    act(() => {
      result.current.setAnonymousChoice({ language: 'nl', answered: true });
    });
    expect(result.current.anonymousChoice.language).toBe('nl');

    act(() => {
      result.current.clearAnonymousChoice();
    });

    expect(result.current.anonymousChoice.language).toBeNull();
    expect(result.current.anonymousChoice.answered).toBe(false);
    // No localStorage key existed or was written
    expect(window.localStorage.getItem(LANGUAGE_OFFER_STORAGE_KEY)).toBeNull();
  });

  it('fresh mount starts at {language:null, answered:false} regardless of localStorage content', async () => {
    // Simulate stale data from a previous implementation
    window.localStorage.setItem(LANGUAGE_OFFER_STORAGE_KEY, JSON.stringify({ language: 'nl', answered: true }));

    const { LanguageOfferProvider, useLanguageOfferContext } = await getModule();

    const { result } = renderHook(() => useLanguageOfferContext(), { wrapper: wrapper(LanguageOfferProvider) });

    // Session-only: localStorage is never read on mount
    expect(result.current.anonymousChoice.answered).toBe(false);
    expect(result.current.anonymousChoice.language).toBeNull();
  });
});
