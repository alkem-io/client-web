import { useContext } from 'react';
import { ApmContext } from './ApmProvider';

export const useApm = () => {
  const context = useContext(ApmContext);
  return context.apm;
};
