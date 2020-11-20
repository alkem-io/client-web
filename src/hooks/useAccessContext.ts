import { useContext } from 'react';
import { AccessContext } from '../context/AccessProvider';

export const useAccessContext = () => {
  const context = useContext(AccessContext);

  return context;
};
