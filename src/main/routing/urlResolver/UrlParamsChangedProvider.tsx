import { createContext, ReactNode, useContext, useEffect } from 'react';
import useUrlResolver from './useUrlResolver';
import { useLocation } from 'react-router-dom';
import { useUrlParams } from '@/core/routing/useUrlParams';

type UrlParamsChangedContextValue = {};
const emptyResult: UrlParamsChangedContextValue = {};

const UrlParamsChangedContext = createContext<UrlParamsChangedContextValue>(emptyResult);

const UrlParamsChangedProvider = ({ children }: { children: ReactNode }) => {
  const { setUrlParams } = useUrlResolver();

  const location = useLocation();
  const urlParams = useUrlParams();

  useEffect(() => {
    const { '*': _, ...filteredUrlParams } = urlParams;
    setUrlParams(document.location.href, filteredUrlParams);
  }, [location]);

  return <UrlParamsChangedContext.Provider value={emptyResult}>{children}</UrlParamsChangedContext.Provider>;
};

export { UrlParamsChangedProvider, UrlParamsChangedContext };

const useUrlParamsChanged = () => useContext(UrlParamsChangedContext);
export default useUrlParamsChanged;
