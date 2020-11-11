import React, { FC, useEffect, useMemo, useState } from 'react';
import { Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { community } from '../components/core/Typography.dummy.json';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { useAuthenticationContext } from '../hooks/useAuthenticationContext';
import { Community as CommunityPage, FourOuFour } from '../pages';

interface SignInParams {
  redirect?: string;
}

export const SignIn: FC = () => {
  const { redirect } = useParams<SignInParams>();
  const { authenticate } = useAuthenticate();
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
  }, [setFailed, authenticate]);

  if (failed && !authenticated) {
    return <Redirect to={`/restricted?origin=${redirect}`} />;
  }

  if (authenticated && !failed) {
    return <Redirect to={`${decodeURI(redirect || '/')}`} />;
  }

  return <div>Attempting to sign you in</div>;
};
