import { useContext } from 'react';
import { AuthenticationContext } from '../context/AuthenticationProvider';
import { AUTHENTICATED_KEY, AUTH_STATUS_KEY, TOKEN_KEY } from '../models/Constants';
import { AuthStatus } from '../reducers/auth/types';

export const useAuthenticationContext = () => {
  const context = useContext(AuthenticationContext);
  const isAuthenticated = localStorage.getItem(AUTHENTICATED_KEY) === 'true'; //  useTypedSelector<boolean>(state => state.auth.isAuthenticated);
  const status = localStorage.getItem(AUTH_STATUS_KEY) as AuthStatus; // useTypedSelector<AuthStatus>(state => state.auth.status);
  const token = localStorage.getItem(TOKEN_KEY); //useTypedSelector<string | null>(state => state.auth.accessToken);

  return { context, isAuthenticated, status, token: token ?? undefined };
};
