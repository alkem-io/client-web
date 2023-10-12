import { useContext, useMemo } from 'react';
import { ApmContext } from './ApmProvider';

export const useApm = () => {
  const context = useContext(ApmContext);
  return useMemo(() => context.apm, [context]);
};
