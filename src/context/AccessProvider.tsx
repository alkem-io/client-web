import React, { FC, useEffect, useMemo, useState } from 'react';
import { useAuthentication } from '../hooks';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { useAuthenticationContext } from '../hooks/useAuthenticationContext';

export interface AccessContextResult {
  loading: boolean;
}

const AccessContext = React.createContext<AccessContextResult>({
  loading: true,
});

const AccessProvider: FC<{}> = ({ children }) => {
  const { safeRefresh } = useAuthenticate();
  const { isAuthenticated } = useAuthenticationContext();
  const { loading: authenticationLoading } = useAuthentication();

  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    setIsRefreshing(true);
    safeRefresh().then(() => {
      console.log('Refreshing finished!');
      setIsRefreshing(false);
    });
  }, [safeRefresh]);

  useEffect(() => {
    let timerId = -1;
    if (isAuthenticated) timerId = window.setInterval(safeRefresh, 30 * 60 * 1000);
    return () => {
      console.log('Clearing itnerval');
      window.clearInterval(timerId);
    };
  }, [safeRefresh, isAuthenticated]);

  const loading = useMemo(() => authenticationLoading || isRefreshing, [authenticationLoading, isRefreshing]);

  return (
    <AccessContext.Provider
      value={{
        loading,
      }}
    >
      {children}
    </AccessContext.Provider>
  );
};

export { AccessProvider, AccessContext };
