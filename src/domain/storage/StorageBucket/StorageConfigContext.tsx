import { createContext, PropsWithChildren, useContext } from 'react';
import useStorageConfig, { StorageConfigOptions, StorageConfigProvided } from './useStorageConfig';

const StorageConfigContext = createContext<StorageConfigProvided | undefined>(undefined);

export const StorageConfigContextProvider = ({ children, ...props }: PropsWithChildren<StorageConfigOptions>) => {
  const storageConfig = useStorageConfig(props);

  return <StorageConfigContext value={storageConfig}>{children}</StorageConfigContext>;
};

export const useStorageConfigContext = () => {
  const storageConfig = useContext(StorageConfigContext);
  if (!storageConfig) {
    throw new Error('No StorageConfigContext provided.');
  }
  return storageConfig.storageConfig;
};
