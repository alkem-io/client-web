import axios from 'axios';
import { print } from 'graphql/language/printer';
import React, { FC, useEffect, useState } from 'react';
import Loading from '../components/core/Loading';
import { QUERY_CONFIG } from '../graphql/config';
import { Configuration } from '../models/Configuration';
import { Error } from '../pages/Error';
import { getConfig } from '../utils/configHelper';
export interface ConfigContext {
  config: Configuration;
  loading: boolean;
}

const configContext = React.createContext<ConfigContext>({
  config: getConfig(),
  loading: true,
});

interface ConfigProviderProps {
  apiUrl: string;
}

const ConfigProvider: FC<ConfigProviderProps> = ({ children, apiUrl }) => {
  const [config, setConfig] = useState(getConfig());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    setLoading(true);

    const queryConfig = async (url: string) => {
      const result = await axios.post(
        url,
        {
          query: print(QUERY_CONFIG),
        },
        {
          responseType: 'json',
        }
      );
      if (result) {
        return getConfig(result.data.data.configuration);
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
