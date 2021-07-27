import { useContext, useMemo } from 'react';
import { UserContext } from '../../context/UserProvider';

export const useUserContext = () => {
  const context = useContext(UserContext);

  return useMemo(() => ({ ...context }), [context]);
};
