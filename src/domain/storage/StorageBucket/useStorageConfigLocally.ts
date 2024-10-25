import { useCallback } from 'react';

export const useStorageConfigLocally = () => ({
  setLastOpenedStorageConfig: useCallback((storageBucketId: string) => {
    localStorage.setItem('lastOpenedStorageBucketId', storageBucketId);
  }, []),
});
