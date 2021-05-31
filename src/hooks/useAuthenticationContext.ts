import { useContext, useMemo } from 'react';
import { AuthenticationContext } from '../context/AuthenticationProvider';
import { AuthStatus } from '../reducers/auth/types';
import { useTypedSelector } from './useTypedSelector';
import { useWhoami } from './useWhoami';

export const useAuthenticationContext = () => {
  const { data: iam } = useWhoami();
  const context = useContext(AuthenticationContext);

  const status = useTypedSelector<AuthStatus>(state => state.auth.status);
  const token = useTypedSelector<string | null>(state => state.auth.accessToken);
  const isAuthenticated = useMemo(() => !!iam?.identity?.traits?.email, [iam]);
  // const isAuthenticated = !!iam?.identity?.traits?.email;

  return {
    context,
    status,
    token,
    isAuthenticated,
  };
};
