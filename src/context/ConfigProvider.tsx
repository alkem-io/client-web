import axios from 'axios';
import { print } from 'graphql/language/printer';
import React, { FC, useEffect, useState } from 'react';
import Loading from '../components/core/Loading/Loading';
import { ConfigurationDocument } from '../hooks/generated/graphql';
import { Error } from '../pages/Error';
import { ConfigurationFragment, ConfigurationQuery } from '../models/graphql-schema';
import { env } from '../types/env';

const graphQLEndpoint = (env && env.REACT_APP_GRAPHQL_ENDPOINT) || '/graphql';

export interface ConfigContext {
  config?: ConfigurationFragment;
  loading: boolean;
}

const configContext = React.createContext<ConfigContext>({
  loading: true,
});

const ConfigProvider: FC = ({ children }) => {
  const [config, setConfig] = useState<ConfigurationFragment>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    setLoading(true);
    // graphql client is not initialized
    const queryConfig = async (url: string) => {
      const result = await axios.post<{ data: ConfigurationQuery }>(
        url,
        {
          query: print(ConfigurationDocument),
        },
        {
          responseType: 'json',
          withCredentials: true,
        }
      );
      if (result) {
        return result.data.data.configuration;
      }
    };

    if (graphQLEndpoint) {
      queryConfig(graphQLEndpoint)
        .then(result => {
          if (result) {
            setConfig(result);
          }
        })
        .catch(ex => {
          setError(ex);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [graphQLEndpoint]);

  return (
    <configContext.Provider
      value={{
        config,
        loading,
      }}
    >
      {loading && <Loading text={'Loading configuration ...'} />}
      {error && <Error error={error} />}
      {!loading && !error && children}
    </configContext.Provider>
  );
};

export { ConfigProvider, configContext };
