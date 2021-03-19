import React, { FC, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthenticate } from '../hooks/useAuthenticate';
import Loading from '../components/core/Loading';

interface LogoutPageProps {}

export const LogoutPage: FC<LogoutPageProps> = () => {
  const { safeUnauthenticate } = useAuthenticate();
  const history = useHistory();
  useEffect(() => {
    safeUnauthenticate().then(() => {
      history.push('/');
    });

    return () => {};
  }, []);

  return <Loading text={'Loggin out'} />;
};

export default LogoutPage;
