import { createContext, useContext } from 'react';

const ElevationContext = createContext(0);

export const useElevationContext = () => useContext(ElevationContext);

export const ElevationContextProvider = ElevationContext.Provider;
