import React, { FC, useEffect, useState } from 'react';
import Loading from '../components/core/Loading/Loading';
import { ConfigurationDocument } from '../hooks/generated/graphql';
import { ConfigurationQuery } from '../models/graphql-schema';
import queryRequest from '../utils/query-request/query-request';
import { Configuration } from '../models/configuration';
import { logger } from '../services/logging/winston/logger';
import { ErrorPage } from '../pages';

export interface ConfigContextProps {
  config?: Configuration;
  loading: boolean;
  error?: Error;
}

interface ConfigProviderProps {
  url: string;
}

const ConfigContext = React.createContext<ConfigContextProps>({
  config: undefined,
  loading: false,
  error: undefined,
});

const ConfigProvider: FC<ConfigProviderProps> = ({ children, url }) => {
  const [config, setConfig] = useState<Configuration | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    if (!url) {
      return;
    }

    queryRequest<ConfigurationQuery>(url, ConfigurationDocument)
      .then(r => setConfig(r.data.data.configuration))
      .catch((err: Error) => {
        setError(err);
        logger.error(err.message);
      })
      .finally(() => setLoading(false));
  }, [url]);

  if (loading) {
    return <Loading text={'Loading configuration ...'} />;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  return (
    <ConfigContext.Provider
      value={{
        config,
        loading,
        error,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export { ConfigProvider, ConfigContext };
