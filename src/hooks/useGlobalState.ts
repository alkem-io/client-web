import { useContext } from 'react';
import { GlobalStateContext } from '../context/GlobalStateProvider';

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalStateContext must be within GlobalStateProvider');
  }
  return context;
};
