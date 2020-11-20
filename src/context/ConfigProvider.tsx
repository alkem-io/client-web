import axios from 'axios';
import React, { FC, useEffect, useState } from 'react';
import Loading from '../components/core/Loading';
import { AadClientConfig } from '../generated/graphql';
import { QUERY_CONFIG_STRING } from '../graphql/config';
import { getConfig } from '../utils/authConfig';
import { Error } from '../pages/Error';
export interface ConfigContext {
  aadConfig: AadClientConfig;
  loading: boolean;
}

const configContext = React.createContext<ConfigContext>({
  aadConfig: getConfig(),
  loading: true,
});

interface ConfigProviderProps {
  apiUrl: string;
}

const ConfigProvider: FC<ConfigProviderProps> = ({ children, apiUrl }) => {
  const [aadConfig, setConfig] = useState(getConfig());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    setLoading(true);

    const queryConfig = async (url: string) => {
      const result = await axios.post(
        url,
        {
          query: QUERY_CONFIG_STRING,
        },
        {
          responseType: 'json',
        }
      );
      if (result) {
        return getConfig(result.data.data.clientConfig);
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
        aadConfig,
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
