import { useContext, useMemo } from 'react';
import { AuthenticationContext } from '../context/AuthenticationProvider';
import { AuthStatus } from '../reducers/auth/types';
import { useTypedSelector } from './useTypedSelector';

export const useAuthenticationContext = () => {
  const context = useContext(AuthenticationContext);
  const status = useTypedSelector<AuthStatus>(state => state.auth.status);
  const isAuthenticated = useMemo(() => status === 'authenticated', [status]);

  return { context, isAuthenticated, status };
};
