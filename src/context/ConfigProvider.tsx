import axios from 'axios';
import { print } from 'graphql/language/printer';
import React, { FC, useEffect, useState } from 'react';
import Loading from '../components/core/Loading/Loading';
import { ConfigurationDocument } from '../hooks/generated/graphql';
import { ErrorPage } from '../pages';
import { ConfigurationFragment, ConfigurationQuery } from '../models/graphql-schema';

export interface ConfigContext {
  config?: ConfigurationFragment;
  loading: boolean;
}

interface Props {
  apiUrl: string;
}

const configContext = React.createContext<ConfigContext>({
  loading: true,
});

const ConfigProvider: FC<Props> = ({ children, apiUrl }) => {
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
      {error && <ErrorPage error={error} />}
      {!loading && !error && children}
    </configContext.Provider>
  );
};

export { ConfigProvider, configContext };
