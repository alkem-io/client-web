import { createContext, useContext } from 'react';

const UrlBaseContext = createContext<{ base: string } | undefined>(undefined);

export const useUrlBase = () => {
  const context = useContext(UrlBaseContext);
  return context?.base;
};
