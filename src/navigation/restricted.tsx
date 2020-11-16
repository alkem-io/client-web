import React, { FC, useEffect } from 'react';
import { useQueryParams } from '../hooks/useQueryParams';
import { useTransactionScope } from '../hooks/useSentry';
import { Restricted as RestrictedPage } from '../pages';
import { info as logInfo } from '../sentry/log';

interface RestrictedParams {
  origin?: string;
}

export const Restricted: FC = () => {
  useTransactionScope({ type: 'authentication' });
  const params = useQueryParams();
  const origin = params.get('origin');

  useEffect(() => {
    logInfo(`Attempted access to: ${origin}`);
  }, [origin]);

  return <RestrictedPage attemptedTarget={origin || ''} />;
};
