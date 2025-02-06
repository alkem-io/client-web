import { ServerMetadataDocument } from '@/core/apollo/generated/apollo-hooks';
import { Metadata, ServerMetadataQuery } from '@/core/apollo/generated/graphql-schema';
import queryRequest from '@/core/http/queryRequest';
import { TagCategoryValues, warn as logWarn } from '@/core/logging/sentry/log';
import useLoadingStateWithHandlers from '@/domain/shared/utils/useLoadingStateWithHandlers';
import React, { FC, PropsWithChildren, useEffect, useState } from 'react';

interface ServerMetadataContextProps {
  metadata?: Partial<Metadata>;
  loading: boolean;
  error?: Error;
}

export const ServerMetadataContext = React.createContext<ServerMetadataContextProps>({
  metadata: undefined,
  loading: false,
  error: undefined,
});

interface ServerMetadataProviderProps extends PropsWithChildren {
  url: string;
}

const ServerMetadataProvider: FC<ServerMetadataProviderProps> = ({ url, children }) => {
  const [metadata, setMetadata] = useState<Partial<Metadata> | undefined>();

  const [requestMetadata, loading, error] = useLoadingStateWithHandlers(
    async (url: string) => {
      const result = await queryRequest<ServerMetadataQuery>(url, ServerMetadataDocument);
      setMetadata(result.data.data.platform.metadata);
    },
    {
      onError: err => logWarn(err, { category: TagCategoryValues.CONFIG }),
    }
  );

  useEffect(() => {
    requestMetadata(url);
  }, [url]);

  return (
    <ServerMetadataContext.Provider
      value={{
        metadata,
        loading,
        error,
      }}
    >
      {children}
    </ServerMetadataContext.Provider>
  );
};

export default ServerMetadataProvider;
