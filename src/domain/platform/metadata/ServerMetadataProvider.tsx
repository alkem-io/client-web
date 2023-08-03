import React, { FC, useEffect, useState } from 'react';
import { Metadata, ServerMetadataQuery } from '../../../core/apollo/generated/graphql-schema';
import { ServerMetadataDocument } from '../../../core/apollo/generated/apollo-hooks';
import { logger } from '../../../services/logging/winston/logger';
import queryRequest from '../../../common/utils/query-request/query-request';
import useLoadingStateWithHandlers from '../../shared/utils/useLoadingStateWithHandlers';

interface ServerMetadataContextProps {
  metadata?: Metadata;
  loading: boolean;
  error?: Error;
}

export const ServerMetadataContext = React.createContext<ServerMetadataContextProps>({
  metadata: undefined,
  loading: false,
  error: undefined,
});

export interface ServerMetadataProviderProps {
  url: string;
}

const ServerMetadataProvider: FC<ServerMetadataProviderProps> = ({ url, children }) => {
  const [metadata, setMetadata] = useState<Metadata | undefined>();

  const [requestMetadata, loading, error] = useLoadingStateWithHandlers(
    async (url: string) => {
      const result = await queryRequest<ServerMetadataQuery>(url, ServerMetadataDocument);
      setMetadata(result.data.data.platform.metadata);
    },
    {
      onError: err => logger.error(err.message),
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
