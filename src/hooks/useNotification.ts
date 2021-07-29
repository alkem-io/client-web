import { useDispatch } from 'react-redux';
import { pushNotification } from '../store/notifincations/actions';
import { Severity } from '../store/notifincations/types';

export const useNotification = () => {
  const dispatch = useDispatch();
  return (message: string, severity: Severity = 'information') => {
    dispatch(pushNotification(message, severity));
  };
};
