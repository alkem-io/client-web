import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { Severity } from '../store/notifincations/types';
import { useNotification } from './useNotification';

export const useApolloErrorHandler = (severity: Severity = 'error') => {
  const notify = useNotification();
  return (error: ApolloError) => {
    const networkError = error.networkError as any;
    if (networkError && networkError.result && networkError.result.errors) {
      const graphqlError = networkError.result.errors[0] as GraphQLError;
      notify(graphqlError.message, severity);
    } else {
      notify(error.message, severity);
    }
  };
};
