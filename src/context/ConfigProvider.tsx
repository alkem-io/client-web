import axios from 'axios';
import { print } from 'graphql/language/printer';
import React, { FC, useEffect, useState } from 'react';
import Loading from '../components/core/Loading';
import { ConfigurationDocument } from '../hooks/generated/graphql';
import { Error } from '../pages/Error';
import { ConfigurationFragment, ConfigurationQuery } from '../models/graphql-schema';
export interface ConfigContext {
  config?: ConfigurationFragment;
  loading: boolean;
}

const configContext = React.createContext<ConfigContext>({
  loading: true,
});

interface ConfigProviderProps {
  apiUrl: string;
}

const ConfigProvider: FC<ConfigProviderProps> = ({ children, apiUrl }) => {
  const [config, setConfig] = useState<ConfigurationFragment>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    setLoading(true);

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

    if (apiUrl) {
      queryConfig(apiUrl)
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
  }, [apiUrl]);

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
