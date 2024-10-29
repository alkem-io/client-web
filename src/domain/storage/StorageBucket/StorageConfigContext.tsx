import { useState, useContext, createContext, PropsWithChildren } from 'react';
import useStorageConfig, { type StorageConfigOptions, type StorageConfigProvided } from './useStorageConfig';

const StorageConfigContext = createContext<StorageConfigProvided | undefined>(undefined);

export const StorageConfigContextProvider = ({ children, ...rest }: PropsWithChildren<StorageConfigOptions>) => {
  const [isTemporary, setIsTemporary] = useState(false);

  const storageConfig = useStorageConfig(rest)?.storageConfig;

  const ctxValue = {
    storageConfig: storageConfig
      ? {
          ...storageConfig,
          temporaryLocation: isTemporary,
        }
      : undefined,
    setTemporaryLocation: (arg: boolean) => setIsTemporary(arg),
  };

  console.log('@@@ STORAGE_CONFIG >>>', JSON.stringify(ctxValue.storageConfig, null, 2));

  return <StorageConfigContext.Provider value={ctxValue} children={children} />;
};

export const useStorageConfigContext = () => {
  const storageConfigCtx = useContext(StorageConfigContext);

  if (!storageConfigCtx) {
    throw new Error('No StorageConfigContext provided.');
  }

  return storageConfigCtx;
};
