import { useGlobalState } from './useGlobalState';
import { Severity } from '../state/global/notifications/notificationMachine';

export const useNotification = () => {
  const { notificationsService } = useGlobalState();
  return (message: string, severity: Severity = 'information') => {
    notificationsService.send({
      type: 'PUSH',
      message,
      severity,
    });
  };
};
