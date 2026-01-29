import { useGlobalState } from '@/core/state/useGlobalState';
import { PUSH_NOTIFICATION, Severity } from '@/core/state/global/notifications/notificationMachine';
import { useCallback } from 'react';

export const useNotification = () => {
  const { notificationsService } = useGlobalState();

  return useCallback(
    (message: string, severity: Severity = 'info', numericCode?: number) => {
      notificationsService.send({
        type: PUSH_NOTIFICATION,
        payload: {
          message,
          severity,
          numericCode,
        },
      });
    },
    [notificationsService]
  );
};
