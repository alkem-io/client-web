import React, { FC, useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { useQueryParams } from '../hooks/useQueryParams';

interface SignInParams {
  redirect?: string;
}

export const SignIn: FC = () => {
  const params = useQueryParams();
  const redirect = params.get('redirect');
  const { authenticate, refresh } = useAuthenticate();
  const [authenticated, setAuthenticated] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    async function signIn() {
      try {
        await authenticate();
        setAuthenticated(true);
      } catch (ex) {
        console.error(ex);
        setFailed(true);
      }
    }

    signIn();
  }, [setFailed, authenticate, refresh]);

  if (failed && !authenticated) {
    return <Redirect to={`/restricted?origin=${redirect}`} />;
  }

  if (authenticated && !failed) {
    return <Redirect to={`${decodeURI(redirect || '/')}`} />;
  }

  return <div>Attempting to sign you in</div>;
};
