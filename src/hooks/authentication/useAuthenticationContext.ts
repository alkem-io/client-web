import { useContext } from 'react';
import { AuthenticationContext } from '../../context/AuthenticationProvider';

export const useAuthenticationContext = () => {
  return useContext(AuthenticationContext);
};
