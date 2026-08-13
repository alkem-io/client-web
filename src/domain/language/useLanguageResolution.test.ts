/**
 * T005 paired tests: useLanguageResolution
 * - nl-BE → nl normalisation (US1-AS6)
 * - ['en-US', 'nl-NL'] top-ranked → no offer (US1-AS7)
 * - 'de' not eligible → no offer (US1-AS5)
 * - eligible:[] → no offer for nl (kill-switch R-8)
 * - account preference beats navigator (US2-AS3)
 * - unresolved config → no decision yet (R-10)
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { LanguageConfig } from '@/domain/platform/config/configuration';
import {
  detectBrowserLanguage,
  normaliseToPrimarySubtag,
  resolveDisplayLanguage,
  resolveOfferLanguage,
} from './useLanguageResolution';

const nlConfig: LanguageConfig = { eligible: ['nl'], default: 'en' };
const emptyConfig: LanguageConfig = { eligible: [], default: 'en' };

const emptyAnonymousChoice = { language: null, answered: false };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('normaliseToPrimarySubtag', () => {
  it('nl-BE → nl (US1-AS6)', () => {
    expect(normaliseToPrimarySubtag('nl-BE')).toBe('nl');
  });
  it('nl-NL → nl', () => {
    expect(normaliseToPrimarySubtag('nl-NL')).toBe('nl');
  });
  it('en-US → en', () => {
    expect(normaliseToPrimarySubtag('en-US')).toBe('en');
  });
  it('de → de (no subtag)', () => {
    expect(normaliseToPrimarySubtag('de')).toBe('de');
  });
  it('undefined → undefined', () => {
    expect(normaliseToPrimarySubtag(undefined)).toBeUndefined();
  });
});

describe('detectBrowserLanguage', () => {
  it('returns primary subtag of first navigator.languages entry', () => {
    vi.stubGlobal('navigator', { languages: ['nl-NL', 'en-US'] });
    expect(detectBrowserLanguage()).toBe('nl');
  });

  it('returns undefined when navigator.languages is empty', () => {
    vi.stubGlobal('navigator', { languages: [] });
    expect(detectBrowserLanguage()).toBeUndefined();
  });
});

describe('resolveOfferLanguage', () => {
  it('nl browser → offer nl when eligible', () => {
    vi.stubGlobal('navigator', { languages: ['nl-NL'] });
    expect(resolveOfferLanguage({ languageConfig: nlConfig })).toBe('nl');
  });

  it('nl-BE → nl: regional variant maps to eligible (US1-AS6)', () => {
    vi.stubGlobal('navigator', { languages: ['nl-BE'] });
    expect(resolveOfferLanguage({ languageConfig: nlConfig })).toBe('nl');
  });

  it('en-US top-ranked → no offer even when nl also listed (US1-AS7)', () => {
    vi.stubGlobal('navigator', { languages: ['en-US', 'nl-NL'] });
    expect(resolveOfferLanguage({ languageConfig: nlConfig })).toBeUndefined();
  });

  it('de browser → no offer (not eligible — US1-AS5)', () => {
    vi.stubGlobal('navigator', { languages: ['de'] });
    expect(resolveOfferLanguage({ languageConfig: nlConfig })).toBeUndefined();
  });

  it('eligible:[] → no offer for nl (kill-switch R-8)', () => {
    vi.stubGlobal('navigator', { languages: ['nl-NL'] });
    expect(resolveOfferLanguage({ languageConfig: emptyConfig })).toBeUndefined();
  });

  it('config undefined → no decision yet (R-10)', () => {
    vi.stubGlobal('navigator', { languages: ['nl-NL'] });
    expect(resolveOfferLanguage({ languageConfig: undefined })).toBeUndefined();
  });

  it('invitation suggestion outranks browser detection when eligible (FR-019 #2 > #4)', () => {
    // Browser is English but invitation suggests Dutch
    vi.stubGlobal('navigator', { languages: ['en-US'] });
    expect(resolveOfferLanguage({ languageConfig: nlConfig, invitationSuggestedLanguage: 'nl' })).toBe('nl');
  });

  it('invitation suggestion not eligible → falls back to browser detection (FR-018)', () => {
    vi.stubGlobal('navigator', { languages: ['nl-NL'] });
    // 'de' is not in eligible, so it's skipped; nl from browser is returned
    expect(resolveOfferLanguage({ languageConfig: nlConfig, invitationSuggestedLanguage: 'de' })).toBe('nl');
  });
});

describe('resolveDisplayLanguage', () => {
  it('account preference wins over everything incl. navigator (US2-AS3)', () => {
    vi.stubGlobal('navigator', { languages: ['nl-NL'] });
    expect(
      resolveDisplayLanguage({
        languageConfig: nlConfig,
        accountLanguage: 'es',
        isAuthenticated: true,
        anonymousChoice: emptyAnonymousChoice,
      })
    ).toBe('es');
  });

  it('anonymous accepted choice feeds display when unauthenticated (tier #3)', () => {
    expect(
      resolveDisplayLanguage({
        languageConfig: nlConfig,
        accountLanguage: null,
        isAuthenticated: false,
        anonymousChoice: { language: 'nl', answered: true },
      })
    ).toBe('nl');
  });

  it('falls back to platform default when no preference and no anonymous answer', () => {
    expect(
      resolveDisplayLanguage({
        languageConfig: nlConfig,
        accountLanguage: null,
        isAuthenticated: false,
        anonymousChoice: emptyAnonymousChoice,
      })
    ).toBe('en');
  });

  it('browser-detected nl does NOT feed display (FR-004 / SC-005)', () => {
    vi.stubGlobal('navigator', { languages: ['nl-NL'] });
    const result = resolveDisplayLanguage({
      languageConfig: nlConfig,
      accountLanguage: null,
      isAuthenticated: false,
      anonymousChoice: emptyAnonymousChoice,
    });
    // Should be the platform default, not nl
    expect(result).toBe('en');
  });

  it('config undefined → suspend (returns undefined, R-10)', () => {
    expect(
      resolveDisplayLanguage({
        languageConfig: undefined,
        accountLanguage: null,
        isAuthenticated: false,
        anonymousChoice: emptyAnonymousChoice,
      })
    ).toBeUndefined();
  });
});
