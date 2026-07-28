/**
 * T010 — Anonymous → account language carry (FR-013c + DL-11 — R-4 mitigation).
 *
 * On authenticated landing:
 *  - If marker `alkemio.signupInitiated` is present in sessionStorage AND
 *  - account has {language: null, languageOfferAnswered: false} AND
 *  - an anonymous answer exists in the context (accept OR decline):
 *    → one updateUserSettings call:
 *       accept (language != null) → {language}
 *       decline (language == null) → {languageOfferAnswered: true}
 *    → then clear the marker and the stored anonymous choice
 *
 *  - No marker (plain sign-in, kiosk) → discard the anonymous store untouched
 *    (FR-013d — kiosk protection, R-4).
 *
 * The marker `alkemio.signupInitiated` is sessionStorage (technical basis, DL-11):
 * it is transient (dies with the tab), non-identifying, and strictly necessary for
 * the kiosk-protection invariant.
 *
 * Runs AFTER legacy reconciliation (T006) and BEFORE the banner gate (T007).
 */
import { useEffect, useRef, useState } from 'react';
import { useUpdateUserSettingsMutation } from '@/core/apollo/generated/apollo-hooks';
import type { AnonymousLanguageChoice } from './LanguageOfferContext';

/** sessionStorage marker that proves this tab came from a signup flow. */
export const SIGNUP_INITIATED_MARKER = 'alkemio.signupInitiated';

/** Set this marker at signup entry (called from SignUpCrdRoute). */
export function markSignupInitiated(): void {
  try {
    sessionStorage.setItem(SIGNUP_INITIATED_MARKER, '1');
  } catch {
    // sessionStorage blocked — degrade gracefully
  }
}

/** Read and consume the marker (clears it). Returns whether it was set. */
export function consumeSignupMarker(): boolean {
  try {
    const value = sessionStorage.getItem(SIGNUP_INITIATED_MARKER);
    if (value === '1') {
      sessionStorage.removeItem(SIGNUP_INITIATED_MARKER);
      return true;
    }
  } catch {
    // sessionStorage blocked — treat as no marker
  }
  return false;
}

type AnonymousLanguageCarryOpts = {
  isAuthenticated: boolean;
  /** True while the auth/user session is still resolving (mirrors useLegacyLanguageReconciliation). */
  authLoading: boolean;
  userId: string | undefined;
  accountLanguage: string | null | undefined;
  languageOfferAnswered: boolean | undefined;
  anonymousChoice: AnonymousLanguageChoice;
  discardAnonymousChoice: () => void;
};

type AnonymousLanguageCarryResult = {
  /**
   * True once the carry has either run to completion or determined it is not
   * applicable (gate not met). The banner gate in useCrdLanguage waits for
   * this before evaluating offeredLanguage, preventing the banner from flashing
   * for a fresh-signup user whose anonymous accepted-choice write has not yet
   * settled (FR-013c / DL-11 / R-4 — qual-client-2 fix).
   */
  carryComplete: boolean;
};

/**
 * Carries an anonymous language choice to the newly created account on first
 * authenticated landing after signup, ONLY when the signup marker is present.
 *
 * Kiosk-safe: without the marker the choice is discarded without being written.
 *
 * Returns carryComplete=true once the hook determines it has nothing to do
 * (gate not met) or after the mutation settles.  The banner gate depends on
 * this to avoid showing the offer before the carry write settles.
 */
export function useAnonymousLanguageCarry({
  isAuthenticated,
  authLoading,
  userId,
  accountLanguage,
  languageOfferAnswered,
  anonymousChoice,
  discardAnonymousChoice,
}: AnonymousLanguageCarryOpts): AnonymousLanguageCarryResult {
  const [updateUserSettings] = useUpdateUserSettingsMutation();
  const didRunRef = useRef(false);
  const [carryComplete, setCarryComplete] = useState(false);

  useEffect(() => {
    if (didRunRef.current) return;

    // While auth is still loading we do not know the definitive auth state yet.
    // Wait — do NOT complete prematurely; that would let the banner gate open
    // during an in-flight auth resolution (banner-flash race / item 1 fix).
    if (authLoading) return;

    // Gate: carry only applies for authenticated never-chose accounts with an answered
    // anonymous choice.  All other cases are no-ops → complete immediately.
    if (!isAuthenticated || !userId) {
      setCarryComplete(true);
      return;
    }
    if (accountLanguage != null || languageOfferAnswered) {
      // Account preference wins — discard the in-memory anonymous choice so it
      // cannot leak into the next anonymous session on a shared/kiosk device
      // after an already-configured user signs in/out (FR-013d).
      discardAnonymousChoice();
      setCarryComplete(true);
      return;
    }
    if (!anonymousChoice.answered) {
      setCarryComplete(true);
      return;
    }

    didRunRef.current = true;

    const hasMarker = consumeSignupMarker();

    if (!hasMarker) {
      // Kiosk sign-in: discard the anonymous store WITHOUT writing it to the account.
      discardAnonymousChoice();
      setCarryComplete(true);
      return;
    }

    // Carry: accept or decline.
    const settings =
      anonymousChoice.language != null
        ? { language: anonymousChoice.language }
        : { languageOfferAnswered: true as const };

    void updateUserSettings({
      variables: {
        settingsData: {
          userID: userId,
          settings,
        },
      },
    }).finally(() => {
      // Clear the anonymous store after carry regardless of mutation result.
      discardAnonymousChoice();
      setCarryComplete(true);
    });
  }, [
    isAuthenticated,
    authLoading,
    userId,
    accountLanguage,
    languageOfferAnswered,
    anonymousChoice,
    discardAnonymousChoice,
    updateUserSettings,
  ]);

  return { carryComplete };
}
