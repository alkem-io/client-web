import { useEffect } from 'react';
import { setUserScope, setTransactionScope, TransactionScope } from '../sentry/scope';
import { UserMetadata } from './user/useUserMetadataWrapper';

export const useUserScope = (metadata: UserMetadata | undefined) => {
  useEffect(() => {
    setUserScope((metadata || {}).user);
  }, [metadata]);
};

export const useTransactionScope = (name: TransactionScope) => {
  useEffect(() => {
    setTransactionScope(name);
  }, []);
};
