import { createContext, PropsWithChildren, useContext } from 'react';
import useStorageConfig, { StorageConfigOptions, StorageConfigProvided } from './useStorageConfig';

const StorageConfigContext = createContext<StorageConfigProvided | undefined>(undefined);

/**
 *
 * @param temporaryLocation - false by default unless we're creating a new callout.
 *
 */

export const StorageConfigContextProvider = ({
  children,
  temporaryLocation = false,
  ...rest
}: PropsWithChildren<StorageConfigOptions>) => {
  const storageConfig = useStorageConfig({ ...rest, temporaryLocation });
  // console.log('@@@@@ storageConfig >>>>>', JSON.stringify(storageConfig, null, 2));

  return <StorageConfigContext.Provider value={storageConfig} children={children} />;
};

export const useStorageConfigContext = () => {
  const storageConfig = useContext(StorageConfigContext);

  if (!storageConfig) {
    throw new Error('No StorageConfigContext provided.');
  }

  return storageConfig.storageConfig;
};
