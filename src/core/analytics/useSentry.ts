import { useEffect } from 'react';
import { UserMetadata } from '../../domain/community/contributor/user/hooks/useUserMetadataWrapper';
import { setUserScope, setTransactionScope, TransactionScope } from '../logging/sentry/scope';
import { useConfig } from '../../domain/platform/config/useConfig';

export const useUserScope = (metadata: UserMetadata | undefined) => {
  const { sentry } = useConfig();

  useEffect(() => {
    setUserScope((metadata || {}).user, sentry?.submitPII);
  }, [metadata, sentry?.submitPII]);
};

export const useTransactionScope = (name: TransactionScope) => {
  useEffect(() => {
    setTransactionScope(name);
  }, [name]);
};
