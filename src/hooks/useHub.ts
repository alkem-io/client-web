import { useContext, useMemo } from 'react';
import { HubContext } from '../context/HubProvider';

export const useHub = () => {
  const context = useContext(HubContext);
  return useMemo(
    () => ({
      ...context,
    }),
    [context]
  );
};
