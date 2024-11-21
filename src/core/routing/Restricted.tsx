import { useEffect } from 'react';
import { useTransactionScope } from '../analytics/SentryTransactionScopeContext';
import { useQueryParams } from './useQueryParams';
import { RestrictedPage } from '../pages/Restricted/RestrictedPage';
import { info as logInfo } from '../logging/sentry/log';

export const Restricted = () => {
  useTransactionScope({ type: 'authentication' });
  const params = useQueryParams();
  const origin = params.get('origin');

  useEffect(() => {
    logInfo(`Attempted access to: ${origin}`);
  }, [origin]);

  return <RestrictedPage attemptedTarget={origin || ''} />;
};
