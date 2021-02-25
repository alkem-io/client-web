import { useContext } from 'react';
import { AuthenticationContext } from '../context/AuthenticationProvider';
import { STATUS_KEY, TOKEN_KEY } from '../models/Constantes';
import { AuthStatus } from '../reducers/auth/types';
import { useTypedSelector } from './useTypedSelector';

export const useAuthenticationContext = () => {
  const context = useContext(AuthenticationContext);
  const isAuthenticated = useTypedSelector<boolean>(state => state.auth.isAuthenticated);
  const status = localStorage.getItem(STATUS_KEY) as AuthStatus; // useTypedSelector<AuthStatus>(state => state.auth.status);
  const token = localStorage.getItem(TOKEN_KEY); //useTypedSelector<string | null>(state => state.auth.accessToken);

  return { context, isAuthenticated, status, token: token ?? undefined };
};
