import { useContext, createContext, PropsWithChildren } from 'react';
import useStorageConfig, { type StorageConfigOptions, type StorageConfigProvided } from './useStorageConfig';

const StorageConfigContext = createContext<StorageConfigProvided | undefined>(undefined);

export const StorageConfigContextProvider = ({ children, ...rest }: PropsWithChildren<StorageConfigOptions>) => {
  const result = useStorageConfig(rest);

  if (!result) {
    throw new Error('Storage configuration initialization failed');
  }

  const { storageConfig } = result;

  return <StorageConfigContext.Provider value={storageConfig}>{children}</StorageConfigContext.Provider>;
};

export const useStorageConfigContext = () => {
  const storageConfigCtx = useContext(StorageConfigContext);

  if (!storageConfigCtx) {
    throw new Error('No StorageConfigContext provided.');
  }

  return storageConfigCtx;
};
