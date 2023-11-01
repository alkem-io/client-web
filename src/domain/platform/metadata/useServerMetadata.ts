import { useContext, useMemo } from 'react';
import { ServerMetadataContext } from './ServerMetadataProvider';

const useServerMetadata = () => {
  const ctx = useContext(ServerMetadataContext);
  return useMemo(
    () => ({
      services: ctx?.metadata?.services ?? [],
      loading: ctx.loading,
      error: ctx.error,
    }),
    [ctx]
  );
};

export default useServerMetadata;
