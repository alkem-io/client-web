import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

interface UrlBase {
  base: string;
}

const UrlBaseContext = createContext<UrlBase | undefined>(undefined);

export const UrlBaseProvider = ({ url, children }: PropsWithChildren<{ url: string | undefined }>) => {
  const urlBase = useMemo(() => (url ? { base: url } : undefined), [url]);

  return <UrlBaseContext.Provider value={urlBase}>{children}</UrlBaseContext.Provider>;
};

export const useUrlBase = () => {
  const context = useContext(UrlBaseContext);
  return context?.base;
};
