import React, { FC, useEffect } from 'react';
import { useQueryParams } from '../hooks';
import { useTransactionScope } from '../hooks';
import { Restricted as RestrictedPage } from '../pages';
import { info as logInfo } from '../services/sentry/log';

export const Restricted: FC = () => {
  useTransactionScope({ type: 'authentication' });
  const params = useQueryParams();
  const origin = params.get('origin');

  useEffect(() => {
    logInfo(`Attempted access to: ${origin}`);
  }, [origin]);

  return <RestrictedPage attemptedTarget={origin || ''} />;
};
