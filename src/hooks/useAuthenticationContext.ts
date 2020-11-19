import { useContext } from 'react';
import { AuthenticationContext } from '../context/AuthenticationProvider';
import { AuthStatus } from '../reducers/auth/types';
import { useTypedSelector } from './useTypedSelector';

export const useAuthenticationContext = () => {
  const context = useContext(AuthenticationContext);
  const isAuthenticated = useTypedSelector<boolean>(state => state.auth.isAuthenticated);
  const status = useTypedSelector<AuthStatus>(state => state.auth.status);

  return { context, isAuthenticated, status };
};
