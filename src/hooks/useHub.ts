import { useContext } from 'react';
import { HubContext } from '../context/HubProvider';

export const useHub = () => useContext(HubContext);
