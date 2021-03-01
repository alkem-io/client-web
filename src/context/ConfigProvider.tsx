import axios from 'axios';
import { print } from 'graphql/language/printer';
import React, { FC, useEffect, useState } from 'react';
import Loading from '../components/core/Loading';
import { QUERY_CONFIG } from '../graphql/config';
import { AuthenticationProvider } from '../models/Configuration';
import { Error } from '../pages/Error';
import { getConfig } from '../utils/configHelper';
export interface ConfigContext {
  authenticationProviders: AuthenticationProvider[];
  loading: boolean;
}

const configContext = React.createContext<ConfigContext>({
  authenticationProviders: getConfig().authenticationProviders,
  loading: true,
});

interface ConfigProviderProps {
  apiUrl: string;
}

const ConfigProvider: FC<ConfigProviderProps> = ({ children, apiUrl }) => {
  const [authenticationProviders, setConfig] = useState(getConfig().authenticationProviders);
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
        authenticationProviders,
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
