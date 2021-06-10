import { useContext } from 'react';
import { EcoversesContext } from '../context/EcoversesProvider';

export const useEcoversesContext = () => {
  return useContext(EcoversesContext);
};
