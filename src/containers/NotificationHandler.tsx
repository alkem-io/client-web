import { ReactComponent as CheckCircleFill } from 'bootstrap-icons/icons/check-circle-fill.svg';
import { ReactComponent as ExclamationCircleFill } from 'bootstrap-icons/icons/exclamation-circle-fill.svg';
import { ReactComponent as InfoCircleFill } from 'bootstrap-icons/icons/info-circle-fill.svg';
import { ReactComponent as XCircleFill } from 'bootstrap-icons/icons/x-circle-fill.svg';
import React, { FC } from 'react';
import { Toast } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { clearNotification } from '../reducers/notifincations/actions';
import { Notification, Severity } from '../reducers/notifincations/types';

export const NotificationHandler: FC = () => {
  const notifications = useTypedSelector<Notification[]>(state => state.notifications.notifications);

  const dispatch = useDispatch();

  const closeMessage = (id: string): void => {
    dispatch(clearNotification(id));
  };

  const getIcon = (severity: Severity) => {
    if (severity === 'error') return <XCircleFill className="bi bi-alert-triangle text- mr-2" height="20" width="20" />;
    else if (severity === 'warning')
      return <ExclamationCircleFill className="bi bi-alert-triangle text-warning mr-2" height="20" width="20" />;
    else if (severity === 'success')
      return <CheckCircleFill className="bi bi-alert-triangle text-success mr-2" height="20" width="20" />;
    else return <InfoCircleFill className="bi bi-alert-triangle text-info mr-2" height="20" width="20" />;
  };

  return (
    <>
      <div style={{ position: 'fixed', bottom: 20, right: 20 }}>
        {notifications.map(x => {
          return (
            <Toast show={true} onClose={() => closeMessage(x.id)}>
              <Toast.Header>
                {getIcon(x.severity)}
                <strong className="mr-auto">Notification</strong>
              </Toast.Header>
              <Toast.Body>{x.message}</Toast.Body>
            </Toast>
          );
        })}
      </div>
    </>
  );
};
