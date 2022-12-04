import React, { FC, useEffect } from 'react';
import { useTransactionScope } from '../analytics/useSentry';
import { useQueryParams } from './useQueryParams';
import { RestrictedPage } from '../pages/Restricted/RestrictedPage';
import { info as logInfo } from '../../services/logging/sentry/log';

export const Restricted: FC = () => {
  useTransactionScope({ type: 'authentication' });
  const params = useQueryParams();
  const origin = params.get('origin');

  useEffect(() => {
    logInfo(`Attempted access to: ${origin}`);
  }, [origin]);

  return <RestrictedPage attemptedTarget={origin || ''} />;
};
