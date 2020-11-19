import React, { FC, useCallback, useEffect, useMemo } from 'react';
import Loading from '../components/core/Loading';
import { TOKEN_STORAGE_KEY, useAuthentication } from '../hooks';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { AuthStatus } from '../reducers/auth/types';

export interface AccessContextResult {
  loading: boolean;
}

const AccessContext = React.createContext<AccessContextResult>({
  loading: true,
});

const AccessProvider: FC<{}> = ({ children }) => {
  const { safeRefresh, status } = useAuthenticate();
  const { loading: authenticationLoading } = useAuthentication();

  const isAuthenticated = useMemo(() => status === 'authenticated', [status]);

  useEffect(() => {
    if (!isAuthenticated) {
      safeRefresh();
    }
  }, [safeRefresh, isAuthenticated]);

  useEffect(() => {
    let timerId = -1;
    if (isAuthenticated) timerId = window.setInterval(safeRefresh, 30 * 60 * 1000);
    return () => {
      console.log('Clearing itnerval');
      window.clearInterval(timerId);
    };
  }, [safeRefresh, isAuthenticated]);

  const handleStorageChange = useCallback(
    (e: StorageEvent) => {
      if (e.key === TOKEN_STORAGE_KEY) {
        if (e.newValue === null && e.newValue !== e.oldValue) {
          console.log('Refreshing');
          if (status !== 'refreshing' && status !== 'authenticating') safeRefresh();
        }
      }
    },
    [safeRefresh, status]
  );

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleStorageChange]);

  const loading = authenticationLoading || status === 'authenticating' || status === 'refreshing';

  if (loading) return <Loading text={'Checking access ...'} />;

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
