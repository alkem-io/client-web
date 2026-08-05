/**
 * T005 — Language resolution ladders (DL-6 / FR-019).
 *
 * Detection:
 *   navigator.languages[0] → primary-subtag normalisation (nl-BE → nl)
 *   ONLY the top-ranked language is considered (FR-001).
 *
 * Offer ladder (feeds the banner — never a silent display switch):
 *   pending-invitation suggestion (T012, fed in via invitationSuggestedLanguage) ??
 *   detected browser language.
 *   Both must be in Config.language.eligible (kill-switch: eligible:[] → no offer).
 *
 * Display ladder:
 *   #1 account language (me.user.settings.language, own-scope)
 *   #3 anonymous accepted choice (unauthenticated only)
 *   #5 platform default (Config.language.default)
 *   Tier #4 (browser-detected) NEVER feeds display (FR-004 / SC-005).
 *
 * Suspends until Config resolves — NO hard-coded eligible fallback (R-10).
 */
import { useEffect } from 'react';
import i18n from '@/core/i18n/config';
import type { LanguageConfig } from '@/domain/platform/config/configuration';
import type { AnonymousLanguageChoice } from './LanguageOfferContext';

/** Primary-subtag normalisation: 'nl-BE' → 'nl', 'en-US' → 'en'. */
export function normaliseToPrimarySubtag(tag: string | undefined): string | undefined {
  if (!tag) return undefined;
  return tag.split('-')[0].toLowerCase();
}

/** Returns the top-ranked browser language after primary-subtag normalisation. */
export function detectBrowserLanguage(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const langs = navigator.languages;
  if (!langs || langs.length === 0) return undefined;
  return normaliseToPrimarySubtag(langs[0]);
}

/** Resolves the offer language (banner target — never a silent display switch).
 *  Returns undefined when no offer is appropriate. */
export function resolveOfferLanguage({
  languageConfig,
  invitationSuggestedLanguage,
}: {
  languageConfig: LanguageConfig | undefined | null;
  /** suggestedLanguage from the user's pending Invitation (T012). */
  invitationSuggestedLanguage?: string | null;
}): string | undefined {
  // Suspend if config hasn't loaded yet (R-10 — no hard-coded fallback).
  if (!languageConfig) return undefined;

  const { eligible } = languageConfig;
  if (!eligible || eligible.length === 0) return undefined;

  const eligibleSet = new Set(eligible.map(l => l.toLowerCase()));

  // Tier #2: invitation suggestion (DL-1 — outranks browser detection per FR-019).
  if (invitationSuggestedLanguage) {
    const norm = invitationSuggestedLanguage.toLowerCase();
    if (eligibleSet.has(norm)) return norm;
  }

  // Tier #4: browser detection.
  const detected = detectBrowserLanguage();
  if (detected && eligibleSet.has(detected)) return detected;

  return undefined;
}

/** Resolves the display language for the current context.
 *  Tier #4 (browser) NEVER contributes to display — offer only (FR-004 / SC-005). */
export function resolveDisplayLanguage({
  languageConfig,
  accountLanguage,
  isAuthenticated,
  anonymousChoice,
}: {
  languageConfig: LanguageConfig | undefined | null;
  accountLanguage?: string | null;
  isAuthenticated: boolean;
  anonymousChoice: AnonymousLanguageChoice;
}): string | undefined {
  // Suspend until config resolves.
  if (!languageConfig) return undefined;

  // Tier #1: account preference (authenticated only).
  if (isAuthenticated && accountLanguage) return accountLanguage;

  // Tier #3: anonymous accepted choice (unauthenticated only).
  if (!isAuthenticated && anonymousChoice.answered && anonymousChoice.language) {
    return anonymousChoice.language;
  }

  // Tier #5: platform default.
  return languageConfig.default;
}

/**
 * Hook that applies the resolved display language to i18next.
 * Pure side-effect: call this from CrdLayoutWrapper (or a child).
 */
export function useApplyDisplayLanguage({
  languageConfig,
  accountLanguage,
  isAuthenticated,
  anonymousChoice,
}: {
  languageConfig: LanguageConfig | undefined | null;
  accountLanguage?: string | null;
  isAuthenticated: boolean;
  anonymousChoice: AnonymousLanguageChoice;
}): void {
  const display = resolveDisplayLanguage({
    languageConfig,
    accountLanguage,
    isAuthenticated,
    anonymousChoice,
  });

  useEffect(() => {
    if (display && display !== i18n.language) {
      void i18n.changeLanguage(display);
    }
  }, [display]);
}
