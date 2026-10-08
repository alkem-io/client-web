import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  RESEND_FEEDBACK_TRANSLATION_KEY,
  type ResendFeedback,
  resolveResendFeedback,
} from './resendPlatformInvitationFeedback';

/**
 * Every outcome other than success is shown as an error: a throttled refusal means the email was
 * NOT sent, so it must not read as a neutral hint.
 */
export const RESEND_FEEDBACK_SEVERITY = {
  success: 'success',
  throttled: 'error',
  error: 'error',
} as const satisfies Record<ResendFeedback, 'success' | 'error'>;

/**
 * Shared resend action for pending email invitations (Space community tab and organization
 * Associates tab): runs the supplied resend request, toasts the mapped outcome, and tracks which
 * invitations are in flight so that each row resends independently of the others.
 */
export const useResendPlatformInvitationAction = (resend: (invitationId: string) => Promise<unknown>) => {
  const { t } = useTranslation('crd-spaceSettings');
  const notify = useNotification();
  const [resendingIds, setResendingIds] = useState<ReadonlySet<string>>(new Set());

  const setInFlight = (id: string, inFlight: boolean) =>
    setResendingIds(current => {
      const next = new Set(current);
      if (inFlight) next.add(id);
      else next.delete(id);
      return next;
    });

  const onResend = (id: string) => {
    if (resendingIds.has(id)) return;
    setInFlight(id, true);
    resend(id)
      .then(
        () => resolveResendFeedback(),
        error => resolveResendFeedback(error)
      )
      .then(feedback => {
        notify(t(RESEND_FEEDBACK_TRANSLATION_KEY[feedback]), RESEND_FEEDBACK_SEVERITY[feedback]);
      })
      .finally(() => setInFlight(id, false));
  };

  return { onResend, resendingIds };
};
