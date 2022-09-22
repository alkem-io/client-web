import { useContext } from 'react';
import { HubContext } from './HubContext';

export const useHub = () => useContext(HubContext);
