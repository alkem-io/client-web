import { useCallback } from 'react';
import { PUSH_NOTIFICATION, type Severity } from '@/core/state/global/notifications/notificationMachine';
import { useGlobalState } from '@/core/state/useGlobalState';

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
