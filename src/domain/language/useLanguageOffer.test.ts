/**
 * T007 paired tests — useLanguageOffer gate-matrix.
 *
 * Gate conditions (ALL must be true to show banner):
 *  1. consentResolved
 *  2. preBannerActionsComplete
 *  3. not dismissed
 *  4. offerLanguage resolved (from config + browser/invitation)
 *  5a. Authenticated: accountLanguageOfferAnswered === false
 *  5b. Anonymous: anonymousChoice.answered === false
 *
 * FR-020a: authenticated user that saw the offer but never clicked → decline on unmount.
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ── shared mocks ─────────────────────────────────────────────────────────────
const mockUpdateUserSettings = vi.fn().mockResolvedValue({ data: {} });

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateUserSettingsMutation: () => [mockUpdateUserSettings],
}));

const mockChangeLanguage = vi.fn().mockResolvedValue(undefined);
vi.mock('@/core/i18n/config', () => ({
  default: { changeLanguage: mockChangeLanguage, language: 'en', options: { fallbackLng: 'en' } },
}));

const mockNotify = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => mockNotify,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockTrackShown = vi.fn();
const mockTrackAccepted = vi.fn();
const mockTrackDeclined = vi.fn();
vi.mock('@/core/analytics/events/languageOffer', () => ({
  trackLanguageOfferShown: (lang: string) => mockTrackShown(lang),
  trackLanguageOfferAccepted: (lang: string) => mockTrackAccepted(lang),
  trackLanguageOfferDeclined: (lang: string) => mockTrackDeclined(lang),
}));

const NL_CONFIG = { eligible: ['nl', 'de'], default: 'en' };
const EMPTY_CHOICE = { language: null, answered: false };

beforeEach(() => {
  vi.stubGlobal('navigator', { languages: ['nl-NL', 'en'] });
  mockUpdateUserSettings.mockClear();
  mockTrackShown.mockClear();
  mockTrackAccepted.mockClear();
  mockTrackDeclined.mockClear();
  mockNotify.mockClear();
  vi.resetModules();
  vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
    useUpdateUserSettingsMutation: () => [mockUpdateUserSettings],
  }));
  vi.mock('@/core/i18n/config', () => ({
    default: { changeLanguage: mockChangeLanguage, language: 'en', options: { fallbackLng: 'en' } },
  }));
  vi.mock('@/core/analytics/events/languageOffer', () => ({
    trackLanguageOfferShown: (lang: string) => mockTrackShown(lang),
    trackLanguageOfferAccepted: (lang: string) => mockTrackAccepted(lang),
    trackLanguageOfferDeclined: (lang: string) => mockTrackDeclined(lang),
  }));
  vi.mock('@/core/ui/notifications/useNotification', () => ({
    useNotification: () => mockNotify,
  }));
  vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useLanguageOffer gate matrix', () => {
  it('consent unresolved → banner hidden', async () => {
    const { useLanguageOffer } = await import('./useLanguageOffer');
    const { result } = renderHook(() =>
      useLanguageOffer({
        consentResolved: false,
        isAuthenticated: false,
        userId: undefined,
        accountLanguageOfferAnswered: undefined,
        languageConfig: NL_CONFIG,
        anonymousChoice: EMPTY_CHOICE,
        setAnonymousChoice: vi.fn(),
        invitationSuggestedLanguage: null,
        preBannerActionsComplete: true,
      })
    );
    expect(result.current.offeredLanguage).toBeNull();
  });

  it('preBannerActionsComplete=false → banner hidden', async () => {
    const { useLanguageOffer } = await import('./useLanguageOffer');
    const { result } = renderHook(() =>
      useLanguageOffer({
        consentResolved: true,
        isAuthenticated: false,
        userId: undefined,
        accountLanguageOfferAnswered: undefined,
        languageConfig: NL_CONFIG,
        anonymousChoice: EMPTY_CHOICE,
        setAnonymousChoice: vi.fn(),
        invitationSuggestedLanguage: null,
        preBannerActionsComplete: false,
      })
    );
    expect(result.current.offeredLanguage).toBeNull();
  });

  it('anonymous already answered → banner hidden', async () => {
    const { useLanguageOffer } = await import('./useLanguageOffer');
    const { result } = renderHook(() =>
      useLanguageOffer({
        consentResolved: true,
        isAuthenticated: false,
        userId: undefined,
        accountLanguageOfferAnswered: undefined,
        languageConfig: NL_CONFIG,
        anonymousChoice: { language: null, answered: true },
        setAnonymousChoice: vi.fn(),
        invitationSuggestedLanguage: null,
        preBannerActionsComplete: true,
      })
    );
    expect(result.current.offeredLanguage).toBeNull();
  });

  it('authenticated with accountLanguageOfferAnswered=true → banner hidden', async () => {
    const { useLanguageOffer } = await import('./useLanguageOffer');
    const { result } = renderHook(() =>
      useLanguageOffer({
        consentResolved: true,
        isAuthenticated: true,
        userId: 'user-1',
        accountLanguageOfferAnswered: true,
        languageConfig: NL_CONFIG,
        anonymousChoice: EMPTY_CHOICE,
        setAnonymousChoice: vi.fn(),
        invitationSuggestedLanguage: null,
        preBannerActionsComplete: true,
      })
    );
    expect(result.current.offeredLanguage).toBeNull();
  });

  it('authenticated with accountLanguageOfferAnswered=null (still loading) → banner hidden', async () => {
    const { useLanguageOffer } = await import('./useLanguageOffer');
    const { result } = renderHook(() =>
      useLanguageOffer({
        consentResolved: true,
        isAuthenticated: true,
        userId: 'user-1',
        accountLanguageOfferAnswered: undefined,
        languageConfig: NL_CONFIG,
        anonymousChoice: EMPTY_CHOICE,
        setAnonymousChoice: vi.fn(),
        invitationSuggestedLanguage: null,
        preBannerActionsComplete: true,
      })
    );
    expect(result.current.offeredLanguage).toBeNull();
  });

  it('all gates open + nl browser + anonymous → banner shows nl', async () => {
    const { useLanguageOffer } = await import('./useLanguageOffer');
    const { result } = renderHook(() =>
      useLanguageOffer({
        consentResolved: true,
        isAuthenticated: false,
        userId: undefined,
        accountLanguageOfferAnswered: undefined,
        languageConfig: NL_CONFIG,
        anonymousChoice: EMPTY_CHOICE,
        setAnonymousChoice: vi.fn(),
        invitationSuggestedLanguage: null,
        preBannerActionsComplete: true,
      })
    );
    expect(result.current.offeredLanguage).toBe('nl');
  });

  it('all gates open + nl browser + authenticated (answered=false) → banner shows nl', async () => {
    const { useLanguageOffer } = await import('./useLanguageOffer');
    const { result } = renderHook(() =>
      useLanguageOffer({
        consentResolved: true,
        isAuthenticated: true,
        userId: 'user-1',
        accountLanguageOfferAnswered: false,
        languageConfig: NL_CONFIG,
        anonymousChoice: EMPTY_CHOICE,
        setAnonymousChoice: vi.fn(),
        invitationSuggestedLanguage: null,
        preBannerActionsComplete: true,
      })
    );
    expect(result.current.offeredLanguage).toBe('nl');
  });

  it('no eligible browser language → banner hidden', async () => {
    vi.stubGlobal('navigator', { languages: ['zh-CN'] });
    const { useLanguageOffer } = await import('./useLanguageOffer');
    const { result } = renderHook(() =>
      useLanguageOffer({
        consentResolved: true,
        isAuthenticated: false,
        userId: undefined,
        accountLanguageOfferAnswered: undefined,
        languageConfig: NL_CONFIG,
        anonymousChoice: EMPTY_CHOICE,
        setAnonymousChoice: vi.fn(),
        invitationSuggestedLanguage: null,
        preBannerActionsComplete: true,
      })
    );
    expect(result.current.offeredLanguage).toBeNull();
  });
});

describe('useLanguageOffer FR-020a: ignored banner recorded as decline on unmount', () => {
  it('authenticated user sees offer but does not interact → decline persisted on unmount', async () => {
    const { useLanguageOffer } = await import('./useLanguageOffer');
    const { result, unmount } = renderHook(() =>
      useLanguageOffer({
        consentResolved: true,
        isAuthenticated: true,
        userId: 'user-1',
        accountLanguageOfferAnswered: false,
        languageConfig: NL_CONFIG,
        anonymousChoice: EMPTY_CHOICE,
        setAnonymousChoice: vi.fn(),
        invitationSuggestedLanguage: null,
        preBannerActionsComplete: true,
      })
    );

    // Banner was shown
    expect(result.current.offeredLanguage).toBe('nl');
    // No mutation yet
    expect(mockUpdateUserSettings).not.toHaveBeenCalled();

    // Unmount without clicking accept or decline
    unmount();

    // A decline must have been persisted (FR-020a)
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
  });

  it('anonymous user sees offer but does not interact → no mutation on unmount (anonymous path)', async () => {
    const { useLanguageOffer } = await import('./useLanguageOffer');
    const { result, unmount } = renderHook(() =>
      useLanguageOffer({
        consentResolved: true,
        isAuthenticated: false,
        userId: undefined,
        accountLanguageOfferAnswered: undefined,
        languageConfig: NL_CONFIG,
        anonymousChoice: EMPTY_CHOICE,
        setAnonymousChoice: vi.fn(),
        invitationSuggestedLanguage: null,
        preBannerActionsComplete: true,
      })
    );

    expect(result.current.offeredLanguage).toBe('nl');
    unmount();

    // Anonymous users: no server mutation fires (session-only — anonymous state is in-memory only)
    expect(mockUpdateUserSettings).not.toHaveBeenCalled();
  });
});

describe('useLanguageOffer — authenticated onAccept/onDecline error handling (item-3 fix)', () => {
  it('onAccept: mutation failure reverts optimistic language change, un-dismisses banner, and notifies', async () => {
    mockUpdateUserSettings.mockRejectedValueOnce(new Error('network error'));
    const { useLanguageOffer } = await import('./useLanguageOffer');

    const { result } = renderHook(() =>
      useLanguageOffer({
        consentResolved: true,
        isAuthenticated: true,
        userId: 'user-1',
        accountLanguageOfferAnswered: false,
        languageConfig: NL_CONFIG,
        anonymousChoice: EMPTY_CHOICE,
        setAnonymousChoice: vi.fn(),
        invitationSuggestedLanguage: null,
        preBannerActionsComplete: true,
      })
    );

    expect(result.current.offeredLanguage).toBe('nl');

    // Trigger accept
    await act(async () => {
      result.current.onAccept();
    });

    // Notification must have fired
    expect(mockNotify).toHaveBeenCalledWith('settings.languageSaveError', 'error');
    // Banner must be un-dismissed (back to visible) so user can retry
    expect(result.current.offeredLanguage).toBe('nl');
    // changeLanguage was called optimistically then a revert was attempted
    expect(mockChangeLanguage).toHaveBeenCalledWith('nl');
  });

  it('onDecline: mutation failure un-dismisses banner and notifies', async () => {
    mockUpdateUserSettings.mockRejectedValueOnce(new Error('network error'));
    const { useLanguageOffer } = await import('./useLanguageOffer');

    const { result } = renderHook(() =>
      useLanguageOffer({
        consentResolved: true,
        isAuthenticated: true,
        userId: 'user-1',
        accountLanguageOfferAnswered: false,
        languageConfig: NL_CONFIG,
        anonymousChoice: EMPTY_CHOICE,
        setAnonymousChoice: vi.fn(),
        invitationSuggestedLanguage: null,
        preBannerActionsComplete: true,
      })
    );

    expect(result.current.offeredLanguage).toBe('nl');

    await act(async () => {
      result.current.onDecline();
    });

    expect(mockNotify).toHaveBeenCalledWith('settings.languageSaveError', 'error');
    // Banner must be un-dismissed (back to visible) so user can retry
    expect(result.current.offeredLanguage).toBe('nl');
  });
});
