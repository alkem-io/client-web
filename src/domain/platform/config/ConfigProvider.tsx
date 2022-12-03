import React, { FC, useEffect, useState } from 'react';
import { ApolloError } from '@apollo/client';
import queryRequest from '../../../common/utils/query-request/query-request';
import { Loading } from '../../../common/components/core';
import { ConfigurationDocument } from '../../../core/apollo/generated/apollo-hooks';
import { ConfigurationQuery } from '../../../core/apollo/generated/graphql-schema';
import { logger } from '../../../services/logging/winston/logger';
import { Configuration } from './configuration';
import useLoadingStateWithHandlers from '../../../hooks/useLoadingStateWithHandlers';

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

  const [requestConfig, loading, error] = useLoadingStateWithHandlers(
    async (url: string) => {
      const result = await queryRequest<ConfigurationQuery>(url, ConfigurationDocument);
      setConfig(result.data.data.configuration);
    },
    {
      onError: err => logger.error(err.message),
    }
  );

  useEffect(() => {
    requestConfig(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
