/**
 * T007 — Language offer banner gate orchestration.
 *
 * Gate (ALL of):
 *  1. Cookie-consent state resolved (any answer) — FR-013b-ii
 *  2. Offer not yet answered:
 *     - Authenticated: me.user.settings.languageOfferAnswered === false
 *     - Anonymous: context.answered === false
 *  3. An offer language exists (resolveOfferLanguage returns a value)
 *  4. Landing-order: reconcile (T006) → carry (T010) → banner gate
 *
 * Actions:
 *  - Authenticated accept: updateUserSettings({language})
 *  - Authenticated decline/dismiss: updateUserSettings({languageOfferAnswered: true})
 *  - Anonymous accept: setAnonymousChoice({language, answered: true}) + i18n.changeLanguage
 *  - Anonymous decline/dismiss: setAnonymousChoice({language: null, answered: true})
 *
 * FR-020a: dismiss = decline.
 */
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  trackLanguageOfferAccepted,
  trackLanguageOfferDeclined,
  trackLanguageOfferShown,
} from '@/core/analytics/events/languageOffer';
import { useUpdateUserSettingsMutation } from '@/core/apollo/generated/apollo-hooks';
import i18n from '@/core/i18n/config';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { LanguageConfig } from '@/domain/platform/config/configuration';
import type { AnonymousLanguageChoice } from './LanguageOfferContext';
import { resolveOfferLanguage } from './useLanguageResolution';

type UseLanguageOfferOpts = {
  /** Set to true once cookie-consent banner has been resolved (any answer). */
  consentResolved: boolean;
  isAuthenticated: boolean;
  userId: string | undefined;
  accountLanguageOfferAnswered: boolean | undefined;
  languageConfig: LanguageConfig | undefined | null;
  anonymousChoice: AnonymousLanguageChoice;
  setAnonymousChoice: (choice: AnonymousLanguageChoice) => void;
  /** From T012 — pending invitation's suggestedLanguage for never-chose users. */
  invitationSuggestedLanguage?: string | null;
  /** True while reconciliation (T006) / carry (T010) are still running. */
  preBannerActionsComplete: boolean;
};

type UseLanguageOfferResult = {
  /** The language being offered, or null if the banner should not be shown. */
  offeredLanguage: string | null;
  onAccept: () => void;
  onDecline: () => void;
};

export function useLanguageOffer({
  consentResolved,
  isAuthenticated,
  userId,
  accountLanguageOfferAnswered,
  languageConfig,
  anonymousChoice,
  setAnonymousChoice,
  invitationSuggestedLanguage,
  preBannerActionsComplete,
}: UseLanguageOfferOpts): UseLanguageOfferResult {
  const [updateUserSettings] = useUpdateUserSettingsMutation();
  const notify = useNotification();
  const { t } = useTranslation('crd-language');
  // Local dismissed state so the banner hides immediately after action without waiting for refetch.
  const [dismissed, setDismissed] = useState(false);

  const offerLanguage = resolveOfferLanguage({ languageConfig, invitationSuggestedLanguage });

  // Gate evaluation
  const shouldShow = (() => {
    if (!consentResolved) return false;
    if (!preBannerActionsComplete) return false;
    if (dismissed) return false;
    if (!offerLanguage) return false;
    if (isAuthenticated) {
      // For authenticated users, show only when languageOfferAnswered is explicitly false.
      if (accountLanguageOfferAnswered == null) return false; // still loading
      if (accountLanguageOfferAnswered) return false;
    } else {
      if (anonymousChoice.answered) return false;
    }
    return true;
  })();

  const offeredLanguage: string | null = shouldShow && offerLanguage ? offerLanguage : null;

  // Track 'shown' once per unique offer language (T009 / DL-9 / SC-006a).
  const [lastTrackedShown, setLastTrackedShown] = useState<string | null>(null);
  useEffect(() => {
    if (offeredLanguage && offeredLanguage !== lastTrackedShown) {
      setLastTrackedShown(offeredLanguage);
      trackLanguageOfferShown(offeredLanguage);
    }
  }, [offeredLanguage, lastTrackedShown]);

  // FR-020a: ignored banner = decline.
  // For authenticated users, when the banner was shown but the tab/session ends before
  // the user explicitly accepts or declines, we record a decline on unmount so the
  // banner is not shown again on the next sign-in (SC-004 / FR-020a).
  // We use a ref to capture the latest values without making the cleanup re-register on
  // every render (cleanup must reference stable values, not stale closure snapshots).
  const shownAndUnansweredRef = useRef<{
    isAuthenticated: boolean;
    userId: string | undefined;
    offeredLanguage: string | null;
    dismissed: boolean;
  }>({ isAuthenticated, userId, offeredLanguage: null, dismissed: false });
  shownAndUnansweredRef.current = { isAuthenticated, userId, offeredLanguage, dismissed };

  useEffect(() => {
    return () => {
      const {
        isAuthenticated: wasAuth,
        userId: uid,
        offeredLanguage: lang,
        dismissed: wasDismissed,
      } = shownAndUnansweredRef.current;
      // Only fire for authenticated users who saw the offer but never clicked.
      if (!wasAuth || !uid || !lang || wasDismissed) return;
      void updateUserSettings({
        variables: {
          settingsData: {
            userID: uid,
            settings: { languageOfferAnswered: true },
          },
        },
      });
    };
  }, []);

  const onAccept = () => {
    setDismissed(true);
    if (!offerLanguage) return;
    trackLanguageOfferAccepted(offerLanguage);
    if (isAuthenticated && userId) {
      // Optimistically switch language; revert on mutation failure.
      void i18n.changeLanguage(offerLanguage);
      void updateUserSettings({
        variables: {
          settingsData: {
            userID: userId,
            settings: { language: offerLanguage },
          },
        },
      }).catch(() => {
        // Revert optimistic language change and un-dismiss so the banner can retry.
        void i18n.changeLanguage((i18n.options.fallbackLng as string) ?? 'en');
        setDismissed(false);
        notify(t('settings.languageSaveError'), 'error');
      });
    } else {
      setAnonymousChoice({ language: offerLanguage, answered: true });
      void i18n.changeLanguage(offerLanguage);
    }
  };

  const onDecline = () => {
    setDismissed(true);
    if (offerLanguage) {
      trackLanguageOfferDeclined(offerLanguage);
    }
    if (isAuthenticated && userId) {
      void updateUserSettings({
        variables: {
          settingsData: {
            userID: userId,
            settings: { languageOfferAnswered: true },
          },
        },
      }).catch(() => {
        // Revert: un-dismiss so the banner can retry.
        setDismissed(false);
        notify(t('settings.languageSaveError'), 'error');
      });
    } else {
      setAnonymousChoice({ language: null, answered: true });
    }
  };

  return { offeredLanguage, onAccept, onDecline };
}
