import { useContext, useMemo } from 'react';
import { EcoverseContext } from '../context/EcoverseProvider';

export const useEcoverse = () => {
  const context = useContext(EcoverseContext);
  return useMemo(
    () => ({
      ...context,
    }),
    [context]
  );
};
