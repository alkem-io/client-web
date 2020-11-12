import React, { FC, useCallback, useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { useQueryParams } from '../hooks/useQueryParams';
import { useUserContext } from '../hooks/useUserContext';
import { SignIn as SignInPage } from '../pages/SignIn';

interface SignInParams {
  redirect?: string;
}

export const SignIn: FC = () => {
  const params = useQueryParams();
  const redirect = params.get('redirect');
  const [processComplete, setProcessComplete] = useState(false);
  const [processFailed, setProcessFailed] = useState(false);
  const { authenticate } = useAuthenticate();
  const { user } = useUserContext();

  const tryAuthenticate = useCallback(() => {
    async function runProcess() {
      try {
        await authenticate();
      } catch (ex) {
        console.error(ex);
        setProcessFailed(true);
      } finally {
        setProcessComplete(true);
      }
    }

    runProcess();
  }, [authenticate, setProcessComplete, setProcessFailed]);

  if (user && !processFailed) {
    return <Redirect to={`${decodeURI(redirect || '/')}`} />;
  }

  if (processComplete && processFailed) {
    return <Redirect to={`/restricted?origin=${redirect}`} />;
  }

  return <SignInPage onSignIn={tryAuthenticate} />;
};
