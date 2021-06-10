import { ApolloError } from '@apollo/client';
import { Severity } from '../reducers/notifincations/types';
import { useNotification } from './useNotification';

export const useApolloErrorHandler = (severity: Severity = 'error') => {
  const notify = useNotification();
  return (error: ApolloError) => {
    debugger;
    notify(error.message, severity);
  };
};
