import { useCallback } from 'react';
import { useApm } from '@/core/analytics/apm/context/useApm';
import { info as logInfo } from '@/core/logging/sentry/log';
import { TagCategoryValues } from '@/core/logging/sentry/log';

/**
 * Analytics hook for guest whiteboard interactions
 * Sends events to both Elastic APM and Sentry for observability
 */
export const useGuestAnalytics = () => {
  const apm = useApm();

  const trackGuestNameSubmitted = useCallback(
    (guestName: string, isDerived: boolean) => {
      // APM transaction for performance tracking
      if (apm) {
        const transaction = apm.startTransaction('guest_name_submitted', 'user-interaction');
        transaction?.addLabels({
          guestName,
          isDerived: isDerived.toString(),
          source: isDerived ? 'derived' : 'manual',
        });
        transaction?.end();
      }

      // Sentry breadcrumb for debugging
      logInfo(`Guest name submitted: ${guestName} (derived: ${isDerived})`, {
        category: TagCategoryValues.WHITEBOARD,
        label: 'guest_name_submitted',
      });
    },
    [apm]
  );

  const trackWhiteboardLoadSuccess = useCallback(
    (whiteboardId: string, guestName: string) => {
      if (apm) {
        const transaction = apm.startTransaction('whiteboard_load_success', 'page-load');
        transaction?.addLabels({
          whiteboardId,
          guestName,
          accessType: 'guest',
        });
        transaction?.end();
      }

      logInfo(`Guest whiteboard loaded: ${whiteboardId} by ${guestName}`, {
        category: TagCategoryValues.WHITEBOARD,
        label: 'whiteboard_load_success',
      });
    },
    [apm]
  );

  const trackWhiteboardLoadFailure = useCallback(
    (whiteboardId: string, errorMessage: string) => {
      if (apm) {
        const transaction = apm.startTransaction('whiteboard_load_failure', 'error');
        transaction?.addLabels({
          whiteboardId,
          errorMessage,
          accessType: 'guest',
        });
        transaction?.end();
      }

      logInfo(`Guest whiteboard load failed: ${whiteboardId} - ${errorMessage}`, {
        category: TagCategoryValues.WHITEBOARD,
        label: 'whiteboard_load_failure',
      });
    },
    [apm]
  );

  const trackDialogDismissed = useCallback(
    (whiteboardId: string) => {
      if (apm) {
        const transaction = apm.startTransaction('guest_dialog_dismissed', 'user-interaction');
        transaction?.addLabels({
          whiteboardId,
          action: 'cancel',
        });
        transaction?.end();
      }

      logInfo(`Guest join dialog dismissed: ${whiteboardId}`, {
        category: TagCategoryValues.WHITEBOARD,
        label: 'guest_dialog_dismissed',
      });
    },
    [apm]
  );

  const trackDerivedNameUsed = useCallback(
    (whiteboardId: string, derivedName: string, derivationMethod: string) => {
      if (apm) {
        const transaction = apm.startTransaction('derived_name_used', 'user-interaction');
        transaction?.addLabels({
          whiteboardId,
          derivedName,
          derivationMethod, // e.g., "full_name", "first_only", "last_only"
        });
        transaction?.end();
      }

      logInfo(
        `Derived guest name used: ${derivedName} (method: ${derivationMethod}) for whiteboard ${whiteboardId}`,
        {
          category: TagCategoryValues.WHITEBOARD,
          label: 'derived_name_used',
        }
      );
    },
    [apm]
  );

  return {
    trackGuestNameSubmitted,
    trackWhiteboardLoadSuccess,
    trackWhiteboardLoadFailure,
    trackDialogDismissed,
    trackDerivedNameUsed,
  };
};
