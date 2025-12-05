import { useEffect } from 'react';
import { useTransactionScope } from '../analytics/SentryTransactionScopeContext';
import { useQueryParams } from './useQueryParams';
import { info as logInfo } from '../logging/sentry/log';
import Error403 from '../pages/Errors/Error403';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';

export const Restricted = () => {
  useTransactionScope({ type: 'authentication' });
  const params = useQueryParams();
  const origin = params.get('origin');

  useEffect(() => {
    logInfo(`Attempted access to: ${origin}`);
  }, [origin]);

  return (
    <TopLevelLayout>
      <Error403 />
    </TopLevelLayout>
  );
};
