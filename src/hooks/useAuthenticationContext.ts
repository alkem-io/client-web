import { useContext, useMemo } from 'react';
import { AuthenticationContext } from '../context/AuthenticationProvider';
import { AuthStatus } from '../reducers/auth/types';
import { useTypedSelector } from './useTypedSelector';

export const useAuthenticationContext = () => {
  const status = useTypedSelector<AuthStatus>(state => state.auth.status);
  const context = useContext(AuthenticationContext);

  return useMemo(
    () => ({
      ...context,
      status,
    }),
    [context, status]
  );
};
