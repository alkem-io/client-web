import React, { FC, useEffect, useState } from 'react';
import { Metadata, ServerMetadataQuery } from '../models/graphql-schema';
import { ServerMetadataDocument } from '../hooks/generated/graphql';
import { logger } from '../services/logging/winston/logger';
import queryRequest from '../common/utils/query-request/query-request';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    if (!url) {
      return;
    }

    setLoading(true);
    queryRequest<ServerMetadataQuery>(url, ServerMetadataDocument)
      .then(r => setMetadata(r.data.data.metadata))
      .catch((err: Error) => {
        setError(err);
        logger.error(err.message);
      })
      .finally(() => setLoading(false));
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
