import { useContext, useMemo } from 'react';
import { ServerMetadataContext } from '../context/ServerMetadataProvider';

const useServerMetadata = () => {
  const ctx = useContext(ServerMetadataContext);
  return useMemo(
    () => ({
      metrics: ctx?.metadata?.metrics ?? [],
      services: ctx?.metadata?.services ?? [],
      loading: ctx.loading,
      error: ctx.error,
    }),
    [ctx]
  );
};

export default useServerMetadata;
