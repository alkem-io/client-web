import { useContext } from 'react';
import { HubContext } from './HubContextProvider';

export const useHub = () => useContext(HubContext);
