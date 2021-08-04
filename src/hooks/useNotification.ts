import { useGlobalState } from './useGlobalState';
import { PUSH_NOTIFICATION, Severity } from '../state/global/notifications/notificationMachine';
import { useCallback } from 'react';

export const useNotification = () => {
  const { notificationsService } = useGlobalState();

  return useCallback(
    (message: string, severity: Severity = 'information') => {
      notificationsService.send({
        type: PUSH_NOTIFICATION,
        payload: {
          message,
          severity,
        },
      });
    },
    [notificationsService]
  );
};
