import { useEffect } from 'react';
import { UserMetadata } from '../context/UserProvider';
import { setUserScope, setTransactionScope, TransactionScope } from '../sentry/scope';

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
