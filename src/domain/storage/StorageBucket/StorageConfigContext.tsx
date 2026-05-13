import { createContext, type PropsWithChildren, useContext } from 'react';
import useStorageConfig, { type StorageConfigOptions, type StorageConfigProvided } from './useStorageConfig';

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

/**
 * Non-throwing variant of `useStorageConfigContext` — returns `undefined` when no
 * `StorageConfigContextProvider` wraps the caller. Use this when the feature is
 * progressive-enhancement (e.g. the CRD MarkdownEditor's optional image upload):
 * the component still renders, the storage-dependent affordance is just absent.
 */
export const useOptionalStorageConfigContext = () => {
  const storageConfig = useContext(StorageConfigContext);
  return storageConfig?.storageConfig;
};
