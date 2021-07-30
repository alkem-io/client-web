import { useContext, useMemo } from 'react';
import { AuthenticationContext } from '../../context/AuthenticationProvider';

export const useAuthenticationContext = () => {
  const context = useContext(AuthenticationContext);

  return useMemo(
    () => ({
      ...context,
    }),
    [context]
  );
};
