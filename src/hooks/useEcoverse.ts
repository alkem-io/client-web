import { useContext } from 'react';
import { EcoverseContext } from '../context/EcoverseProvider';

export const useEcoverse = () => {
  return useContext(EcoverseContext);
};
