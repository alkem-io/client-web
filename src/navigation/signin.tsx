import React, { FC, useCallback } from 'react';
import { Redirect } from 'react-router-dom';
import Loading from '../components/core/Loading';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { useQueryParams } from '../hooks/useQueryParams';
import { useTransactionScope } from '../hooks/useSentry';
import { SignIn as SignInPage } from '../pages/SignIn';
import { error as logError } from '../sentry/log';

interface SignInParams {
  redirect?: string;
}

export const SignIn: FC = () => {
  useTransactionScope({ type: 'authentication' });
  const params = useQueryParams();
  const redirect = params.get('redirect');
  const { authenticate, status, isAuthenticated } = useAuthenticate();

  const tryAuthenticate = useCallback(() => {
    async function runProcess() {
      try {
        await authenticate();
      } catch (ex) {
        logError(new Error(ex), scope => scope.setTag('authentication', 'signin'));
      }
    }

    runProcess();
  }, [authenticate]);

  if (status === 'refreshing' || status === 'authenticating') {
    return <Loading text="Signing in..." />;
  }

  if (isAuthenticated) {
    return <Redirect to={`${decodeURI(redirect || '/')}`} />;
  }

  return <SignInPage onSignIn={tryAuthenticate} />;
};
