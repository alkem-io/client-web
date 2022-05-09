import React, { FC, useEffect, useState } from 'react';
import { ApolloError } from '@apollo/client';
import queryRequest from '../../common/utils/query-request/query-request';
import { Loading } from '../../common/components/core';
import { ConfigurationDocument } from '../../hooks/generated/graphql';
import { ConfigurationQuery } from '../../models/graphql-schema';
import { logger } from '../../services/logging/winston/logger';
import { Configuration } from '../../models/configuration';

export interface ConfigContextProps {
  config?: Configuration;
  loading: boolean;
  error?: ApolloError;
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

  return (
    <ConfigContext.Provider
      value={{
        config,
        loading,
        error: error && new ApolloError({ errorMessage: error.message }),
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export { ConfigProvider, ConfigContext };
