import React, { FC, useCallback, useState } from 'react';
import { Redirect } from 'react-router-dom';
import Loading from '../components/core/Loading';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { useQueryParams } from '../hooks/useQueryParams';
import { useTransactionScope } from '../hooks/useSentry';
import { useUserContext } from '../hooks/useUserContext';
import { SignIn as SignInPage } from '../pages/SignIn';
import { error as logError } from '../sentry/log';

interface SignInParams {
  redirect?: string;
}

export const SignIn: FC = () => {
  useTransactionScope({ type: 'authentication' });
  const params = useQueryParams();
  const redirect = params.get('redirect');
  const [processStarted, setProcessStarted] = useState(false);
  const [processCompleted, setProcessComplete] = useState(false);
  const [processFailed, setProcessFailed] = useState(false);
  const { authenticate } = useAuthenticate();
  const { user, loading } = useUserContext();

  const tryAuthenticate = useCallback(() => {
    async function runProcess() {
      setProcessStarted(true);
      try {
        await authenticate();
      } catch (ex) {
        logError(new Error(ex), scope => scope.setTag('authentication', 'signin'));
        setProcessFailed(true);
      } finally {
        setProcessComplete(true);
      }
    }

    runProcess();
  }, [authenticate, setProcessComplete, setProcessFailed]);

  if (loading) {
    return <Loading text="Authenticating..." />;
  }

  if (user && !(processStarted !== processCompleted)) {
    return <Redirect to={`${decodeURI(redirect || '/')}`} />;
  }

  if (processStarted && processCompleted && processFailed) {
    return <Redirect to={`/restricted?origin=${redirect}`} />;
  }

  return <SignInPage onSignIn={tryAuthenticate} />;
};
