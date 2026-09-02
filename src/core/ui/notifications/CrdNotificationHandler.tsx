import type { TFunction } from 'i18next';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CLEAR_NOTIFICATION, type Severity } from '@/core/state/global/notifications/useNotifications';
import { useGlobalState } from '@/core/state/useGlobalState';
import { Toaster } from '@/crd/primitives/sonner';
import { getNotificationAutoHideDuration } from './constants';
import { generateSupportMailtoUrl } from './generateSupportMailtoUrl';

const toastBySeverity: Record<Severity, typeof toast.error> = {
  error: toast.error,
  success: toast.success,
  info: toast.info,
  warning: toast.warning,
};

const ErrorDescription = ({ numericCode, t }: { numericCode: number | undefined; t: TFunction }) => {
  const mailtoUrl = generateSupportMailtoUrl({ numericCode, t });
  return (
    <>
      {numericCode !== undefined && (
        <div className="opacity-80">{t('apollo.errors.support.errorCode', { code: numericCode })}</div>
      )}
      <a
        href={mailtoUrl}
        className="mt-1 inline-block underline hover:no-underline"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = mailtoUrl;
        }}
      >
        {t('apollo.errors.support.linkText')}
      </a>
    </>
  );
};

export const CrdNotificationHandler = () => {
  const { notifications, notificationsDispatch } = useGlobalState();
  const { t } = useTranslation();
  const shownIds = useRef(new Set<string>());

  useEffect(() => {
    notifications.forEach(n => {
      if (shownIds.current.has(n.id)) {
        return;
      }
      shownIds.current.add(n.id);

      const clear = () => notificationsDispatch({ type: CLEAR_NOTIFICATION, payload: { id: n.id } });

      toastBySeverity[n.severity](n.message, {
        id: n.id,
        duration: getNotificationAutoHideDuration(n.severity),
        description: n.severity === 'error' ? <ErrorDescription numericCode={n.numericCode} t={t} /> : undefined,
        onAutoClose: clear,
        onDismiss: clear,
      });
    });

    const currentIds = new Set(notifications.map(n => n.id));
    shownIds.current.forEach(id => {
      if (!currentIds.has(id)) {
        shownIds.current.delete(id);
      }
    });
  }, [notifications, notificationsDispatch, t]);

  return <Toaster position="bottom-right" />;
};
