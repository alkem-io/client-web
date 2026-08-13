/**
 * T007 — Top-level language orchestration for CrdLayoutWrapper.
 *
 * Landing order (DL-3 / DL-11 / R-9):
 *   1. useLegacyLanguageReconciliation — adopt a legacy i18nextLng value once, for
 *      authenticated users whose server-side language is still null (T006).
 *   2. useApplyDisplayLanguage — apply account / anonymous / default display language.
 *   3. useLanguageOffer — gate the offer banner (shown ONLY after consent resolves).
 *
 * All three hooks gate on languageConfig being available (R-10): they return
 * early / return null when config is still loading.
 *
 * Cookie-consent resolved: `cookies.accepted_cookies !== undefined` (any value means
 * the user has seen and answered the cookie consent banner — FR-013b-ii).
 */
import { useCookies } from 'react-cookie';
import type { CurrentUserLightQuery } from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useConfig } from '@/domain/platform/config/useConfig';
import { ALKEMIO_COOKIE_NAME } from '@/main/cookies/useAlkemioCookies';
import { useLanguageOfferContext } from './LanguageOfferContext';
import { useAnonymousLanguageCarry } from './useAnonymousLanguageCarry';
import { useInvitationSuggestedLanguage } from './useInvitationSuggestedLanguage';
import { useLanguageOffer } from './useLanguageOffer';
import { useApplyDisplayLanguage } from './useLanguageResolution';
import { useLegacyLanguageReconciliation } from './useLegacyLanguageReconciliation';

type CrdLanguageResult = {
  /** Set this on the LanguageOfferBanner when non-null. */
  offeredLanguage: string | null;
  onAcceptLanguageOffer: () => void;
  onDeclineLanguageOffer: () => void;
};

export function useCrdLanguage(): CrdLanguageResult {
  const [cookies] = useCookies([ALKEMIO_COOKIE_NAME]);
  // Consent is "resolved" when ANY value has been written (accept-all, accept-selected, accept-technical-only).
  const consentResolved = cookies[ALKEMIO_COOKIE_NAME] !== undefined;

  const { isAuthenticated, loading: authLoading, userModel } = useCurrentUserContext();
  const { language: languageConfig } = useConfig();

  // Cast to the CurrentUserLightQuery user shape which includes language settings fields (T001).
  type CurrentUser = NonNullable<CurrentUserLightQuery['me']['user']>;
  const userDetails = userModel as CurrentUser | undefined;
  const userId = userDetails?.id;
  const accountLanguage = userDetails?.settings?.language ?? null;
  const accountLanguageOfferAnswered = userDetails?.settings?.languageOfferAnswered;

  const { anonymousChoice, setAnonymousChoice, clearAnonymousChoice } = useLanguageOfferContext();

  // Step 1: legacy i18nextLng reconciliation (runs at most once per auth session, T006).
  // authLoading is passed so the hook can signal reconcileComplete=true immediately
  // for definitively-anonymous visitors (BUG-B fix: without this, anonymous visitors
  // never got reconcileComplete=true and the banner gate stayed permanently closed).
  const { reconcileComplete } = useLegacyLanguageReconciliation({
    isAuthenticated,
    authLoading,
    userId,
    accountLanguage,
    languageOfferAnswered: accountLanguageOfferAnswered,
    languageConfig,
  });

  // Step 2a: anonymous → account carry (T010). Runs after reconciliation.
  // clearAnonymousChoice (not discardOnAuth) is passed so the persisted localStorage key
  // is removed on BOTH branches — carry-consumed and kiosk-discard (corr-client-1 fix).
  // carryComplete gates the banner so it does not show while the carry write is in flight
  // (qual-client-2 fix: a fresh-signup user who already answered anonymously must not see
  // the banner before their carry updateUserSettings settles — FR-013c / DL-11 / R-4).
  const { carryComplete } = useAnonymousLanguageCarry({
    isAuthenticated,
    authLoading,
    userId,
    accountLanguage,
    languageOfferAnswered: accountLanguageOfferAnswered,
    anonymousChoice,
    discardAnonymousChoice: clearAnonymousChoice,
  });

  // Step 2b: apply the resolved display language to i18next (account > anonymous > default).
  useApplyDisplayLanguage({
    languageConfig,
    accountLanguage,
    isAuthenticated,
    anonymousChoice,
  });

  // T012: invitation tier — suggestion from any pending invitation (outranks browser detection).
  const invitationSuggestedLanguage = useInvitationSuggestedLanguage();

  // Step 3: banner gate (shown AFTER reconcile + carry + apply are complete — FR-013b-ii / R-9).
  // preBannerActionsComplete = reconcile has run AND carry has settled (or neither is needed).
  const preBannerActionsComplete = reconcileComplete && carryComplete;

  const { offeredLanguage, onAccept, onDecline } = useLanguageOffer({
    consentResolved,
    isAuthenticated,
    userId,
    accountLanguageOfferAnswered,
    languageConfig,
    anonymousChoice,
    setAnonymousChoice,
    invitationSuggestedLanguage,
    preBannerActionsComplete,
  });

  return { offeredLanguage, onAcceptLanguageOffer: onAccept, onDeclineLanguageOffer: onDecline };
}
