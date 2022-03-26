import { useContext, useMemo } from 'react';
import { ServerMetadataContext } from '../context/ServerMetadataProvider';

const useServerMetadata = () => {
  const ctx = useContext(ServerMetadataContext);
  return useMemo(
    () => ({
      activity: ctx?.metadata?.activity ?? [],
      services: ctx?.metadata?.services ?? [],
      loading: ctx.loading,
      error: ctx.error,
    }),
    [ctx]
  );
};

export default useServerMetadata;
