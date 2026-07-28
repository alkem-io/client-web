/**
 * T010 paired tests — useAnonymousLanguageCarry (FR-013c + DL-11 kiosk protection).
 *
 * Covers:
 *  - signup marker present + accept → updateUserSettings({language}) called + store cleared
 *  - signup marker present + decline → updateUserSettings({languageOfferAnswered: true}) called + store cleared
 *  - no marker (kiosk sign-in) → no write + store cleared (corr-client-1)
 *  - account already has language set → no-op (gate not met)
 *  - anonymousChoice not answered → no-op
 *  - not authenticated → no-op
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SIGNUP_INITIATED_MARKER } from './useAnonymousLanguageCarry';

// ── mocks ─────────────────────────────────────────────────────────────────────
const mockUpdateUserSettings = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateUserSettingsMutation: () => [mockUpdateUserSettings],
}));

beforeEach(() => {
  mockUpdateUserSettings.mockClear();
  mockUpdateUserSettings.mockResolvedValue({ data: {} });
  try {
    sessionStorage.clear();
  } catch {
    // ignore in jsdom
  }
  vi.resetModules();
  vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
    useUpdateUserSettingsMutation: () => [mockUpdateUserSettings],
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

const baseOpts = {
  isAuthenticated: true,
  authLoading: false,
  userId: 'user-1',
  accountLanguage: null,
  languageOfferAnswered: false,
};

describe('useAnonymousLanguageCarry — carry path (signup marker present)', () => {
  it('accept carry: updateUserSettings({language}) is called, discardAnonymousChoice fires, and carryComplete becomes true', async () => {
    sessionStorage.setItem(SIGNUP_INITIATED_MARKER, '1');
    const discardAnonymousChoice = vi.fn();

    const { useAnonymousLanguageCarry } = await import('./useAnonymousLanguageCarry');
    const { result } = renderHook(() =>
      useAnonymousLanguageCarry({
        ...baseOpts,
        anonymousChoice: { language: 'nl', answered: true },
        discardAnonymousChoice,
      })
    );

    await act(async () => {});

    expect(mockUpdateUserSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          settingsData: expect.objectContaining({
            userID: 'user-1',
            settings: { language: 'nl' },
          }),
        }),
      })
    );
    expect(discardAnonymousChoice).toHaveBeenCalled();
    // Marker consumed
    expect(sessionStorage.getItem(SIGNUP_INITIATED_MARKER)).toBeNull();
    // carryComplete must be true once the write settles
    expect(result.current.carryComplete).toBe(true);
  });

  it('decline carry: updateUserSettings({languageOfferAnswered: true}) is called, discardAnonymousChoice fires, carryComplete becomes true', async () => {
    sessionStorage.setItem(SIGNUP_INITIATED_MARKER, '1');
    const discardAnonymousChoice = vi.fn();

    const { useAnonymousLanguageCarry } = await import('./useAnonymousLanguageCarry');
    const { result } = renderHook(() =>
      useAnonymousLanguageCarry({
        ...baseOpts,
        anonymousChoice: { language: null, answered: true },
        discardAnonymousChoice,
      })
    );

    await act(async () => {});

    expect(mockUpdateUserSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          settingsData: expect.objectContaining({
            userID: 'user-1',
            settings: { languageOfferAnswered: true },
          }),
        }),
      })
    );
    expect(discardAnonymousChoice).toHaveBeenCalled();
    expect(result.current.carryComplete).toBe(true);
  });
});

describe('useAnonymousLanguageCarry — kiosk path (no marker)', () => {
  it('kiosk sign-in: no updateUserSettings call, discardAnonymousChoice IS called, carryComplete becomes true', async () => {
    // Marker intentionally absent
    const discardAnonymousChoice = vi.fn();

    const { useAnonymousLanguageCarry } = await import('./useAnonymousLanguageCarry');
    const { result } = renderHook(() =>
      useAnonymousLanguageCarry({
        ...baseOpts,
        anonymousChoice: { language: 'nl', answered: true },
        discardAnonymousChoice,
      })
    );

    await act(async () => {});

    // No write to account
    expect(mockUpdateUserSettings).not.toHaveBeenCalled();
    // But the anonymous store IS cleared so localStorage is wiped (corr-client-1)
    expect(discardAnonymousChoice).toHaveBeenCalled();
    expect(result.current.carryComplete).toBe(true);
  });
});

describe('useAnonymousLanguageCarry — gate conditions', () => {
  it('authLoading=true → carryComplete stays false (do not complete while auth is resolving)', async () => {
    const discardAnonymousChoice = vi.fn();

    const { useAnonymousLanguageCarry } = await import('./useAnonymousLanguageCarry');
    const { result } = renderHook(() =>
      useAnonymousLanguageCarry({
        ...baseOpts,
        authLoading: true, // auth still in flight
        anonymousChoice: { language: 'nl', answered: true },
        discardAnonymousChoice,
      })
    );

    await act(async () => {});

    // While auth is still loading the hook must not complete prematurely
    expect(result.current.carryComplete).toBe(false);
    expect(mockUpdateUserSettings).not.toHaveBeenCalled();
    expect(discardAnonymousChoice).not.toHaveBeenCalled();
  });

  it('not authenticated → no-op and carryComplete immediately true', async () => {
    const discardAnonymousChoice = vi.fn();

    const { useAnonymousLanguageCarry } = await import('./useAnonymousLanguageCarry');
    const { result } = renderHook(() =>
      useAnonymousLanguageCarry({
        ...baseOpts,
        isAuthenticated: false,
        userId: undefined,
        anonymousChoice: { language: 'nl', answered: true },
        discardAnonymousChoice,
      })
    );

    await act(async () => {});

    expect(mockUpdateUserSettings).not.toHaveBeenCalled();
    expect(discardAnonymousChoice).not.toHaveBeenCalled();
    expect(result.current.carryComplete).toBe(true);
  });

  it('account already has language → discards anonymous choice and carryComplete immediately true (FR-013d kiosk/shared-device fix)', async () => {
    // An already-configured user signs in. Any leftover anonymous choice in
    // localStorage must be discarded so a shared/kiosk device is clean for the
    // next anonymous visitor (FR-013d — account preference wins, anonymous discarded).
    const discardAnonymousChoice = vi.fn();

    const { useAnonymousLanguageCarry } = await import('./useAnonymousLanguageCarry');
    const { result } = renderHook(() =>
      useAnonymousLanguageCarry({
        ...baseOpts,
        accountLanguage: 'de',
        anonymousChoice: { language: 'nl', answered: true },
        discardAnonymousChoice,
      })
    );

    await act(async () => {});

    expect(mockUpdateUserSettings).not.toHaveBeenCalled();
    // discardAnonymousChoice MUST be called so the leftover anonymous choice is cleared
    expect(discardAnonymousChoice).toHaveBeenCalled();
    expect(result.current.carryComplete).toBe(true);
  });

  it('anonymous choice not answered → no-op and carryComplete immediately true', async () => {
    sessionStorage.setItem(SIGNUP_INITIATED_MARKER, '1');
    const discardAnonymousChoice = vi.fn();

    const { useAnonymousLanguageCarry } = await import('./useAnonymousLanguageCarry');
    const { result } = renderHook(() =>
      useAnonymousLanguageCarry({
        ...baseOpts,
        anonymousChoice: { language: null, answered: false },
        discardAnonymousChoice,
      })
    );

    await act(async () => {});

    expect(mockUpdateUserSettings).not.toHaveBeenCalled();
    expect(discardAnonymousChoice).not.toHaveBeenCalled();
    expect(result.current.carryComplete).toBe(true);
  });
});
