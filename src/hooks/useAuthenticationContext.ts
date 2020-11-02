import { useContext } from 'react';
import { AuthenticationContext } from '../context/AuthenticationProvider';
import { useTypedSelector } from './useTypedSelector';

export const useAuthenticationContext = () => {
  const context = useContext(AuthenticationContext);
  const isAuthenticated = useTypedSelector<boolean>(state => state.auth.isAuthenticated);

  return { context, isAuthenticated };
};
