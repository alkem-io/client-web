import { useContext, useMemo } from 'react';
import { AuthenticationContext } from '../context/AuthenticationProvider';
import { AuthStatus } from '../reducers/auth/types';
import { isAuthenticated as isAuthenitcatedCheck } from '../utils/isAuthenitcated';
import { useTypedSelector } from './useTypedSelector';

export const useAuthenticationContext = () => {
  const context = useContext(AuthenticationContext);

  const status = useTypedSelector<AuthStatus>(state => state.auth.status);
  const token = useTypedSelector<string | null>(state => state.auth.accessToken);
  const isAuthenticated = useMemo(() => isAuthenitcatedCheck(status), [status]);

  return {
    context,
    status,
    token,
    isAuthenticated,
  };
};
