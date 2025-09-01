import { createContext, useContext } from 'react';

export const ElevationContext = createContext(0);

export const useElevationContext = () => useContext(ElevationContext);
