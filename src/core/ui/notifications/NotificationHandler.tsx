import { Alert } from '@mui/material';
import { useSelector } from '@xstate/react';
import { CLEAR_NOTIFICATION, type Notification } from '@/core/state/global/notifications/notificationMachine';
import { useGlobalState } from '@/core/state/useGlobalState';
import { getNotificationAutoHideDuration } from './constants';
import { ErrorNotificationContent } from './ErrorNotificationContent';
import NotificationView from './NotificationView';

const NotificationContent = ({ notification }: { notification: Notification }) => {
  // For error notifications, show the enhanced content with support link
  if (notification.severity === 'error') {
    return <ErrorNotificationContent message={notification.message} numericCode={notification.numericCode} />;
  }
  // For other severities, show plain message
  return <>{notification.message}</>;
};

export const NotificationHandler = () => {
  const { notificationsService } = useGlobalState();

  const notifications = useSelector(notificationsService, state => state.context.notifications);

  const closeMessage = (id: string): void => {
    notificationsService.send({ type: CLEAR_NOTIFICATION, payload: { id } });
  };

  return (
    <>
      {notifications.map((x, i) => {
        return (
          <NotificationView
            key={i}
            open={true}
            autoHideDuration={getNotificationAutoHideDuration(x.severity)}
            onClose={() => closeMessage(x.id)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert onClose={() => closeMessage(x.id)} severity={x.severity}>
              <NotificationContent notification={x} />
            </Alert>
          </NotificationView>
        );
      })}
    </>
  );
};
