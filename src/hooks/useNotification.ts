import { useDispatch } from 'react-redux';
import { pushNotification } from '../reducers/notifincations/actions';
import { Severity } from '../reducers/notifincations/types';

export const useNotification = () => {
  const dispatch = useDispatch();
  return (message: string, severity: Severity = 'information') => {
    dispatch(pushNotification(message, severity));
  };
};
