import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';

/**
 * Reports a failed settings template read or write the way legacy's global error link did: a notification, with the
 * hosting dialog left usable. The native client has no global error link.
 */
export function useReportTemplateFailure() {
  const { t } = useTranslation();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();
  return (cause: unknown) => {
    if (cause instanceof ApolloError) {
      handleError(cause);
      return;
    }
    logError(cause instanceof Error ? cause : new Error(String(cause)));
    notify(t('apollo.errors.generic'), 'error');
  };
}
