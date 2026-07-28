/**
 * T006 — Legacy-choice reconciliation (DL-3 — REQUIRED).
 *
 * On authenticated landing where account settings are {language: null, languageOfferAnswered: false}:
 *  1. Read raw localStorage.i18nextLng.
 *  2. If it is a valid supported language ≠ Config.language.default AND ≠ 'inContextTool':
 *     → call updateUserSettings({language: value}) once (server latches the flag).
 *     → apply the language to the current i18next instance.
 *  3. Otherwise (equals default / 'inContextTool' / invalid):
 *     → NO write (keeps the US4 offer available for stale-default users).
 *
 * Runs BEFORE the carry (T010) and the banner gate (T007) on any landing.
 * Idempotent: after the write, account.language !== null, so the gate is naturally false.
 *
 * Returns `reconcileComplete: true` once the hook has determined there is nothing to
 * reconcile (no-op path) or after the mutation has settled (either direction).
 * The banner gate waits for this to be true before showing (R-9).
 *
 * Mitigates R-1 (repos.yaml).
 */
import { useEffect, useRef, useState } from 'react';
import { useUpdateUserSettingsMutation } from '@/core/apollo/generated/apollo-hooks';
import i18n, { supportedLngs } from '@/core/i18n/config';
import type { LanguageConfig } from '@/domain/platform/config/configuration';

type ReconciliationOpts = {
  userId: string | undefined;
  /** From me.user.settings.language — null means "never chose". */
  accountLanguage: string | null | undefined;
  /** From me.user.settings.languageOfferAnswered. */
  languageOfferAnswered: boolean | undefined;
  /** Whether the user is authenticated. */
  isAuthenticated: boolean;
  /**
   * True while authentication / user data is still loading (from CurrentUserProvider.loading).
   * Required so the hook can distinguish "definitively anonymous" from "auth still resolving".
   * When false AND isAuthenticated is false, the visitor is definitively anonymous and
   * reconciliation is a no-op — reconcileComplete must be set to true immediately so the
   * banner gate (R-9) is not blocked indefinitely for anonymous visitors (BUG-B fix).
   */
  authLoading?: boolean;
  /** Platform language config (needed for platformDefault). */
  languageConfig?: LanguageConfig | null;
};

type ReconciliationResult = {
  /** True once reconciliation is complete (either ran or was a no-op). */
  reconcileComplete: boolean;
};

export function useLegacyLanguageReconciliation({
  userId,
  accountLanguage,
  languageOfferAnswered,
  isAuthenticated,
  authLoading = false,
  languageConfig,
}: ReconciliationOpts): ReconciliationResult {
  const [updateUserSettings] = useUpdateUserSettingsMutation();
  const didRunRef = useRef(false);
  const [reconcileComplete, setReconcileComplete] = useState(false);

  const platformDefault = languageConfig?.default;

  useEffect(() => {
    if (didRunRef.current) return;

    // BUG-B fix (FR-013a / R-9): when auth has definitively resolved and the visitor
    // is anonymous, reconciliation is a no-op — there is no account to reconcile.
    // Without this, reconcileComplete stays false forever for anonymous visitors,
    // permanently blocking the banner gate (preBannerActionsComplete=false → no offer).
    // Guard: only signal complete once auth is no longer loading, to avoid treating
    // a still-loading auth state as "definitively anonymous" (kiosk / race).
    if (!authLoading && !isAuthenticated) {
      setReconcileComplete(true);
      return;
    }

    // Not yet authenticated, config not loaded, or not applicable.
    if (!isAuthenticated || !userId) return;
    if (!platformDefault) return;

    // Gate: only run for never-chose accounts with unanswered offer.
    if (accountLanguage != null || languageOfferAnswered) {
      // Gate not met → reconciliation is a no-op, mark complete immediately.
      setReconcileComplete(true);
      return;
    }

    // Read legacy i18nextLng.
    let legacy: string | null = null;
    try {
      legacy = window.localStorage.getItem('i18nextLng');
    } catch {
      setReconcileComplete(true);
      return;
    }

    if (!legacy) {
      // No legacy value → no-op.
      setReconcileComplete(true);
      return;
    }

    // Validate: must be a real supported language, not inContextTool, not the platform default.
    const supportedSet = new Set<string>(supportedLngs.filter(l => l !== 'inContextTool'));
    if (!supportedSet.has(legacy) || legacy === platformDefault || legacy === 'inContextTool') {
      // Invalid / redundant → no-op.
      setReconcileComplete(true);
      return;
    }

    // Mark as run before the async call to prevent concurrent fires.
    didRunRef.current = true;

    // Write to account (server latches languageOfferAnswered = true per FR-023 invariant).
    void updateUserSettings({
      variables: {
        settingsData: {
          userID: userId,
          settings: { language: legacy },
        },
      },
    })
      .then(() => {
        // Apply to display immediately.
        void i18n.changeLanguage(legacy);
        setReconcileComplete(true);
      })
      .catch(() => {
        // Non-fatal — reset so a retry could fire on next render cycle.
        didRunRef.current = false;
        // Still mark complete so the banner is not indefinitely blocked.
        setReconcileComplete(true);
      });
  }, [
    authLoading,
    isAuthenticated,
    userId,
    accountLanguage,
    languageOfferAnswered,
    platformDefault,
    updateUserSettings,
  ]);

  return { reconcileComplete };
}
