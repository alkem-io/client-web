import { useEffect } from 'react';
import { setUserScope, setTransactionScope, TransactionScope } from '../services/logging/sentry/scope';
import { UserMetadata } from './user/useUserMetadataWrapper';
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
