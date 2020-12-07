import React, { FC, useCallback, useEffect } from 'react';
import { TOKEN_STORAGE_KEY, useAuthentication } from '../hooks';
import { useAuthenticate } from '../hooks/useAuthenticate';

export interface AccessContextResult {
  loading: boolean;
}

const AccessContext = React.createContext<AccessContextResult>({
  loading: true,
});

const AccessProvider: FC = ({ children }) => {
  const { safeRefresh, status, isAuthenticated } = useAuthenticate();
  const { loading: authenticationLoading } = useAuthentication();

  useEffect(() => {
    // safeRefresh();
  }, []);

  useEffect(() => {
    let timerId = -1;
    if (isAuthenticated) timerId = window.setInterval(safeRefresh, 30 * 60 * 1000);
    return () => {
      window.clearInterval(timerId);
    };
  }, [safeRefresh, isAuthenticated]);

  const handleStorageChange = useCallback(
    (e: StorageEvent) => {
      if (e.key === TOKEN_STORAGE_KEY) {
        if (e.newValue === null && e.newValue !== e.oldValue) {
          // if (status === 'done') safeRefresh();
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

  // if (loading) return <Loading text={'Checking access ...'} />;

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
