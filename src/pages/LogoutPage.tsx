import React, { FC, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthenticate } from '../hooks/useAuthenticate';
import Loading from '../components/core/Loading';
import { useUpdateNavigation } from '../hooks/useNavigation';

interface LogoutPageProps {}

export const LogoutPage: FC<LogoutPageProps> = () => {
  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });
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
