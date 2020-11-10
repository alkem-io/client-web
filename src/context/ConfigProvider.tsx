import React, { FC } from 'react';
import { AadClientConfig, useConfigQuery } from '../generated/graphql';
import { getConfig } from '../utils/authConfig';

export interface ConfigContext {
  aadConfig: AadClientConfig;
  loading: boolean;
}

const configContext = React.createContext<ConfigContext>({
  aadConfig: getConfig(),
  loading: true,
});

const ConfigProvider: FC = ({ children }) => {
  const { data, loading } = useConfigQuery();
  const aadConfig = data ? getConfig(data.clientConfig as AadClientConfig) : getConfig();
  // loading ? console.log('Configuration is loading..') : console.log('...done');
  return (
    <configContext.Provider
      value={{
        aadConfig,
        loading,
      }}
    >
      {children}
    </configContext.Provider>
  );
};

export { ConfigProvider, configContext };
