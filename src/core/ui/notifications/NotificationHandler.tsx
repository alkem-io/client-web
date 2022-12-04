import { Snackbar } from '@mui/material';
import { Alert } from '@mui/material';
import { useSelector } from '@xstate/react';
import React, { FC } from 'react';
import { useGlobalState } from '../../state/useGlobalState';
import { NOTIFICATION_AUTO_HIDE_DURATION } from './constants';
import { CLEAR_NOTIFICATION } from '../../state/global/notifications/notificationMachine';

export const NotificationHandler: FC = () => {
  const { notificationsService } = useGlobalState();

  const notifications = useSelector(notificationsService, state => {
    return state.context.notifications;
  });

  const closeMessage = (id: string): void => {
    notificationsService.send({ type: CLEAR_NOTIFICATION, payload: { id } });
  };

  return (
    <>
      {notifications.map((x, i) => {
        return (
          <Snackbar
            key={i}
            open
            autoHideDuration={NOTIFICATION_AUTO_HIDE_DURATION}
            onClose={() => closeMessage(x.id)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <Alert onClose={() => closeMessage(x.id)} severity={x.severity}>
              {x.message}
            </Alert>
          </Snackbar>
        );
      })}
    </>
  );
};
