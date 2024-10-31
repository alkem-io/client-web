import { useContext, createContext, PropsWithChildren } from 'react';
import useStorageConfig, { type StorageConfigOptions, type StorageConfigProvided } from './useStorageConfig';

const StorageConfigContext = createContext<StorageConfigProvided | undefined>(undefined);

export const StorageConfigContextProvider = ({ children, ...rest }: PropsWithChildren<StorageConfigOptions>) => {
  const storageConfig = useStorageConfig(rest)?.storageConfig;

  return <StorageConfigContext.Provider value={storageConfig} children={children} />;
};

export const useStorageConfigContext = () => {
  const storageConfigCtx = useContext(StorageConfigContext);

  if (!storageConfigCtx) {
    throw new Error('No StorageConfigContext provided.');
  }

  return storageConfigCtx;
};
