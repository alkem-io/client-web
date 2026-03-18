import { useCallback } from 'react';
import { PUSH_NOTIFICATION, type Severity } from '@/core/state/global/notifications/useNotifications';
import { useGlobalState } from '@/core/state/useGlobalState';

export const useNotification = () => {
  const { notificationsDispatch } = useGlobalState();

  return useCallback(
    (message: string, severity: Severity = 'info', numericCode?: number) => {
      notificationsDispatch({
        type: PUSH_NOTIFICATION,
        payload: {
          message,
          severity,
          numericCode,
        },
      });
    },
    [notificationsDispatch]
  );
};
