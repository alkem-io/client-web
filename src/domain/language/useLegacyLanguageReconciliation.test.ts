/**
 * T006 paired tests: useLegacyLanguageReconciliation
 * - 'es' legacy → adopted + display applied (US2-AS4)
 * - 'en' (platform default) → no-op, offer preserved
 * - 'inContextTool' → no-op
 * - garbage/unsupported → no-op
 * - already-answered account → no-op
 * - runs at most once
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockUpdateUserSettings = vi.fn().mockResolvedValue({ data: {} });

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateUserSettingsMutation: () => [mockUpdateUserSettings],
}));

vi.mock('@/core/i18n/config', () => ({
  default: { changeLanguage: vi.fn().mockResolvedValue(undefined), language: 'en' },
  supportedLngs: ['en', 'nl', 'es', 'bg', 'de', 'fr'],
}));

type TestOpts = {
  userId: string | undefined;
  accountLanguage: string | null | undefined;
  languageOfferAnswered: boolean | undefined;
  isAuthenticated: boolean;
  /** auth still loading (defaults false — pass true to simulate in-flight session). */
  authLoading?: boolean;
  /** Convenience: sets languageConfig.default. */
  platformDefault?: string;
};

const renderWithOpts = async (opts: TestOpts) => {
  const { useLegacyLanguageReconciliation } = await import('./useLegacyLanguageReconciliation');
  const hookOpts = {
    ...opts,
    authLoading: opts.authLoading ?? false,
    languageConfig: opts.platformDefault ? { default: opts.platformDefault, eligible: [opts.platformDefault] } : null,
  };
  return renderHook(() => useLegacyLanguageReconciliation(hookOpts));
};

beforeEach(() => {
  window.localStorage.clear();
  mockUpdateUserSettings.mockClear();
  vi.resetModules();
  vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
    useUpdateUserSettingsMutation: () => [mockUpdateUserSettings],
  }));
  vi.mock('@/core/i18n/config', () => ({
    default: { changeLanguage: vi.fn().mockResolvedValue(undefined), language: 'en' },
    supportedLngs: ['en', 'nl', 'es', 'bg', 'de', 'fr'],
  }));
});

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('useLegacyLanguageReconciliation', () => {
  it('adopts a valid legacy language != platform default (US2-AS4)', async () => {
    window.localStorage.setItem('i18nextLng', 'es');
    await renderWithOpts({
      userId: 'user-1',
      accountLanguage: null,
      languageOfferAnswered: false,
      platformDefault: 'en',
      isAuthenticated: true,
    });

    expect(mockUpdateUserSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          settingsData: expect.objectContaining({
            settings: expect.objectContaining({ language: 'es' }),
          }),
        }),
      })
    );
  });

  it('no-op when legacy language equals platform default (keeps offer available)', async () => {
    window.localStorage.setItem('i18nextLng', 'en');
    await renderWithOpts({
      userId: 'user-1',
      accountLanguage: null,
      languageOfferAnswered: false,
      platformDefault: 'en',
      isAuthenticated: true,
    });
    expect(mockUpdateUserSettings).not.toHaveBeenCalled();
  });

  it('no-op for inContextTool legacy value', async () => {
    window.localStorage.setItem('i18nextLng', 'inContextTool');
    await renderWithOpts({
      userId: 'user-1',
      accountLanguage: null,
      languageOfferAnswered: false,
      platformDefault: 'en',
      isAuthenticated: true,
    });
    expect(mockUpdateUserSettings).not.toHaveBeenCalled();
  });

  it('no-op for garbage/unsupported legacy value', async () => {
    window.localStorage.setItem('i18nextLng', 'zz-INVALID');
    await renderWithOpts({
      userId: 'user-1',
      accountLanguage: null,
      languageOfferAnswered: false,
      platformDefault: 'en',
      isAuthenticated: true,
    });
    expect(mockUpdateUserSettings).not.toHaveBeenCalled();
  });

  it('no-op when account already has a language (languageOfferAnswered=true)', async () => {
    window.localStorage.setItem('i18nextLng', 'nl');
    await renderWithOpts({
      userId: 'user-1',
      accountLanguage: 'nl',
      languageOfferAnswered: true,
      platformDefault: 'en',
      isAuthenticated: true,
    });
    expect(mockUpdateUserSettings).not.toHaveBeenCalled();
  });

  it('no-op when definitively anonymous (authLoading=false, isAuthenticated=false) — reconcileComplete=true, no mutation', async () => {
    window.localStorage.setItem('i18nextLng', 'nl');
    const { result } = await renderWithOpts({
      userId: undefined,
      accountLanguage: null,
      languageOfferAnswered: false,
      platformDefault: 'en',
      isAuthenticated: false,
      authLoading: false, // definitively anonymous
    });
    expect(mockUpdateUserSettings).not.toHaveBeenCalled();
    // BUG-B fix: reconcileComplete must be true for definitively-anonymous visitors
    expect(result.current.reconcileComplete).toBe(true);
  });

  it('reconcileComplete stays false while auth is loading (guards against early banner before reconcile)', async () => {
    window.localStorage.setItem('i18nextLng', 'nl');
    const { result } = await renderWithOpts({
      userId: undefined,
      accountLanguage: null,
      languageOfferAnswered: false,
      platformDefault: 'en',
      isAuthenticated: false,
      authLoading: true, // auth still in-flight — not yet definitively anonymous
    });
    expect(mockUpdateUserSettings).not.toHaveBeenCalled();
    expect(result.current.reconcileComplete).toBe(false);
  });
});
