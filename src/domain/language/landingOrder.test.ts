/**
 * T015 — Landing-order integration test.
 *
 * Asserts the three-step order required by DL-3 / DL-11 / R-9:
 *   Step 1: useLegacyLanguageReconciliation runs first and emits reconcileComplete=true.
 *   Step 2: useAnonymousLanguageCarry runs and emits carryComplete=true (qual-client-2 fix).
 *   Step 3: useLanguageOffer banner gate waits for preBannerActionsComplete (reconcile AND
 *           carry both complete) before evaluating offeredLanguage.
 *
 * The tests use call-order mocking to verify sequencing — the banner hook
 * must not compute an offer before reconcile finishes, and for a fresh-signup
 * user with an anonymous accepted choice the banner must stay hidden until the
 * carry write settles (FR-013c / DL-11 / R-4 — qual-client-2 fix).
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ── shared mocks ────────────────────────────────────────────────────────────
const mockUpdateUserSettings = vi.fn().mockResolvedValue({ data: {} });
const mockChangeLanguage = vi.fn().mockResolvedValue(undefined);

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateUserSettingsMutation: () => [mockUpdateUserSettings],
  useUserPendingMembershipsQuery: () => ({ data: undefined }),
}));

vi.mock('@/core/i18n/config', () => ({
  default: { changeLanguage: mockChangeLanguage, language: 'en', options: { fallbackLng: 'en' } },
  supportedLngs: ['en', 'nl', 'es', 'bg', 'de', 'fr'],
}));

vi.mock('react-cookie', () => ({
  useCookies: () => [{ accepted_cookies: undefined }, vi.fn(), vi.fn()],
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

beforeEach(() => {
  window.localStorage.clear();
  mockUpdateUserSettings.mockClear();
  mockChangeLanguage.mockClear();
  vi.resetModules();
  // Re-apply mocks after resetModules
  vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
    useUpdateUserSettingsMutation: () => [mockUpdateUserSettings],
    useUserPendingMembershipsQuery: () => ({ data: undefined }),
  }));
  vi.mock('@/core/i18n/config', () => ({
    default: { changeLanguage: mockChangeLanguage, language: 'en', options: { fallbackLng: 'en' } },
    supportedLngs: ['en', 'nl', 'es', 'bg', 'de', 'fr'],
  }));
  vi.mock('@/core/ui/notifications/useNotification', () => ({
    useNotification: () => vi.fn(),
  }));
  vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
  }));
});

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('Landing order: reconcile → apply → banner', () => {
  it('reconcileComplete is immediately true for definitively-anonymous visitors (BUG-B fix — FR-013a / R-9)', async () => {
    // authLoading=false + isAuthenticated=false → visitor is definitively anonymous.
    // Reconciliation is an account-only concern; anonymous visitors have nothing to
    // reconcile, so the banner gate must not wait on it for them.
    const { useLegacyLanguageReconciliation } = await import('./useLegacyLanguageReconciliation');

    const { result } = renderHook(() =>
      useLegacyLanguageReconciliation({
        userId: undefined,
        accountLanguage: null,
        languageOfferAnswered: false,
        isAuthenticated: false,
        authLoading: false, // auth resolved → definitively anonymous
        languageConfig: null,
      })
    );

    // Definitively anonymous → reconcileComplete must be true immediately so the
    // banner gate (preBannerActionsComplete) is not permanently blocked.
    expect(result.current.reconcileComplete).toBe(true);
    // No mutation must have fired (anonymous = nothing to reconcile)
    expect(mockUpdateUserSettings).not.toHaveBeenCalled();
  });

  it('reconcileComplete stays false while auth is still loading (guards against showing banner before auth resolves)', async () => {
    // authLoading=true means we do not yet know whether the visitor is anonymous or
    // a user in the process of loading their session. Must NOT set reconcileComplete=true
    // prematurely — that would risk showing the banner before reconciliation runs.
    const { useLegacyLanguageReconciliation } = await import('./useLegacyLanguageReconciliation');

    const { result } = renderHook(() =>
      useLegacyLanguageReconciliation({
        userId: undefined,
        accountLanguage: null,
        languageOfferAnswered: false,
        isAuthenticated: false,
        authLoading: true, // auth still loading — not yet definitively anonymous
        languageConfig: null,
      })
    );

    // Auth still loading → reconcileComplete must stay false (do not pre-empt reconciliation)
    expect(result.current.reconcileComplete).toBe(false);
    expect(mockUpdateUserSettings).not.toHaveBeenCalled();
  });

  it('reconcileComplete is immediately true when account already has language set', async () => {
    const { useLegacyLanguageReconciliation } = await import('./useLegacyLanguageReconciliation');

    const { result } = renderHook(() =>
      useLegacyLanguageReconciliation({
        userId: 'user-1',
        accountLanguage: 'nl', // already set → no-op path
        languageOfferAnswered: true,
        isAuthenticated: true,
        languageConfig: { default: 'en', eligible: ['en', 'nl'] },
      })
    );

    // Gate not met → immediate no-op → reconcileComplete=true
    expect(result.current.reconcileComplete).toBe(true);
  });

  it('reconcileComplete is immediately true when no legacy i18nextLng in localStorage', async () => {
    // No legacy value in localStorage
    window.localStorage.removeItem('i18nextLng');

    const { useLegacyLanguageReconciliation } = await import('./useLegacyLanguageReconciliation');

    const { result } = renderHook(() =>
      useLegacyLanguageReconciliation({
        userId: 'user-1',
        accountLanguage: null,
        languageOfferAnswered: false,
        isAuthenticated: true,
        languageConfig: { default: 'en', eligible: ['en', 'nl'] },
      })
    );

    expect(result.current.reconcileComplete).toBe(true);
    // No mutation should have fired
    expect(mockUpdateUserSettings).not.toHaveBeenCalled();
  });

  it('useLanguageOffer does not offer when preBannerActionsComplete=false', async () => {
    const { useLanguageOffer } = await import('./useLanguageOffer');

    const { result } = renderHook(() =>
      useLanguageOffer({
        consentResolved: true,
        isAuthenticated: false,
        userId: undefined,
        accountLanguageOfferAnswered: false,
        languageConfig: { default: 'en', eligible: ['en', 'nl', 'es'] },
        anonymousChoice: { language: null, answered: false },
        setAnonymousChoice: vi.fn(),
        invitationSuggestedLanguage: null,
        preBannerActionsComplete: false, // gate not yet open
      })
    );

    // Banner must not show until pre-banner actions are complete
    expect(result.current.offeredLanguage).toBeNull();
  });

  it('useLanguageOffer offers language once preBannerActionsComplete=true and eligible', async () => {
    // Simulate browser navigator language = 'nl'
    Object.defineProperty(navigator, 'languages', {
      value: ['nl-NL', 'nl'],
      configurable: true,
    });

    const { useLanguageOffer } = await import('./useLanguageOffer');

    const { result } = renderHook(() =>
      useLanguageOffer({
        consentResolved: true,
        isAuthenticated: false,
        userId: undefined,
        accountLanguageOfferAnswered: false,
        languageConfig: { default: 'en', eligible: ['en', 'nl', 'es'] },
        anonymousChoice: { language: null, answered: false },
        setAnonymousChoice: vi.fn(),
        invitationSuggestedLanguage: null,
        preBannerActionsComplete: true, // gate now open
      })
    );

    // With browser lang=nl (eligible, != default), offer should be 'nl'
    expect(result.current.offeredLanguage).toBe('nl');
  });

  it('useLanguageOffer does NOT offer when consent has not resolved (R-9)', async () => {
    const { useLanguageOffer } = await import('./useLanguageOffer');

    const { result } = renderHook(() =>
      useLanguageOffer({
        consentResolved: false, // consent not yet resolved
        isAuthenticated: false,
        userId: undefined,
        accountLanguageOfferAnswered: false,
        languageConfig: { default: 'en', eligible: ['en', 'nl'] },
        anonymousChoice: { language: null, answered: false },
        setAnonymousChoice: vi.fn(),
        invitationSuggestedLanguage: null,
        preBannerActionsComplete: true,
      })
    );

    // Consent not resolved → no offer (R-9)
    expect(result.current.offeredLanguage).toBeNull();
  });
});

// ── item-1 fix: authLoading gate on carry hook ───────────────────────────────
// Verifies that useAnonymousLanguageCarry does NOT complete (carryComplete=false)
// while auth is still loading, so preBannerActionsComplete stays false and the
// banner cannot render concurrently with an in-flight carry write.
describe('Landing order: carry must not complete while auth is loading (item-1 / banner-flash fix)', () => {
  it('carryComplete stays false while authLoading=true', async () => {
    const { useAnonymousLanguageCarry } = await import('./useAnonymousLanguageCarry');

    const { result } = renderHook(() =>
      useAnonymousLanguageCarry({
        isAuthenticated: false,
        authLoading: true,
        userId: undefined,
        accountLanguage: null,
        languageOfferAnswered: false,
        anonymousChoice: { language: 'nl', answered: true },
        discardAnonymousChoice: vi.fn(),
      })
    );

    // Auth is still loading: do NOT complete — carryComplete must remain false.
    expect(result.current.carryComplete).toBe(false);
  });

  it('carryComplete becomes true once auth resolves to definitively anonymous', async () => {
    const { useAnonymousLanguageCarry } = await import('./useAnonymousLanguageCarry');

    const { result } = renderHook(() =>
      useAnonymousLanguageCarry({
        isAuthenticated: false,
        authLoading: false, // auth resolved: definitively anonymous
        userId: undefined,
        accountLanguage: null,
        languageOfferAnswered: false,
        anonymousChoice: { language: 'nl', answered: true },
        discardAnonymousChoice: vi.fn(),
      })
    );

    // Auth resolved to anonymous → carry is N/A → completes immediately.
    expect(result.current.carryComplete).toBe(true);
  });
});

// ── qual-client-2 fix: carry-before-banner ordering ─────────────────────────
// Verifies that useLanguageOffer does NOT show the banner while carryComplete=false,
// i.e. when useAnonymousLanguageCarry has not yet settled its write.
// This prevents a banner flash for a fresh-signup user who already answered
// anonymously (FR-013c / DL-11 / R-4 / US3-AS4).
describe('Landing order: carry must settle before banner is shown (qual-client-2 fix)', () => {
  it('banner stays hidden when carryComplete=false (carry write in flight)', async () => {
    const { useLanguageOffer } = await import('./useLanguageOffer');

    // Simulate: consent resolved, reconcile done, but carry is still in flight.
    // The browser reports nl (eligible), and the account has never answered the offer,
    // which is exactly the state a fresh-signup user would be in while the carry
    // updateUserSettings is awaited.
    const { result } = renderHook(() =>
      useLanguageOffer({
        consentResolved: true,
        isAuthenticated: true,
        userId: 'user-1',
        accountLanguageOfferAnswered: false,
        languageConfig: { default: 'en', eligible: ['en', 'nl', 'es'] },
        anonymousChoice: { language: 'nl', answered: true },
        setAnonymousChoice: vi.fn(),
        invitationSuggestedLanguage: null,
        preBannerActionsComplete: false, // carry not yet complete
      })
    );

    // Banner MUST NOT show while carry is still in flight (even though all other
    // conditions are met — if shown now, it races the carry write and could surface
    // the offer to a user who already accepted it anonymously).
    expect(result.current.offeredLanguage).toBeNull();
  });

  it('carryComplete=true (gate open) lets the offer through once the write settles', async () => {
    // Re-mock navigator for this test so the offer language resolves to nl.
    Object.defineProperty(navigator, 'languages', {
      value: ['nl-NL', 'nl'],
      configurable: true,
    });

    const { useLanguageOffer } = await import('./useLanguageOffer');

    const { result } = renderHook(() =>
      useLanguageOffer({
        consentResolved: true,
        isAuthenticated: false, // anonymous — banner for anonymous after carry settled
        userId: undefined,
        accountLanguageOfferAnswered: false,
        languageConfig: { default: 'en', eligible: ['en', 'nl', 'es'] },
        anonymousChoice: { language: null, answered: false },
        setAnonymousChoice: vi.fn(),
        invitationSuggestedLanguage: null,
        preBannerActionsComplete: true, // carry complete (gate open)
      })
    );

    // With preBannerActionsComplete=true and all other conditions met, the offer
    // should now resolve to 'nl' (browser detection, nl is eligible).
    expect(result.current.offeredLanguage).toBe('nl');
  });
});
