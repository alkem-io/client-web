import { useEffect } from 'react';
import { UserMetadata } from '../domain/user/hooks/useUserMetadataWrapper';
import { setUserScope, setTransactionScope, TransactionScope } from '../services/logging/sentry/scope';
import { useConfig } from './useConfig';

export const useUserScope = (metadata: UserMetadata | undefined) => {
  const { sentry } = useConfig();

  useEffect(() => {
    setUserScope((metadata || {}).user, sentry?.submitPII);
  }, [metadata]);
};

export const useTransactionScope = (name: TransactionScope) => {
  useEffect(() => {
    setTransactionScope(name);
  }, []);
};
