import React, { FC } from 'react';
import { Loading } from '../components/core/Loading';
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

  return (
    <configContext.Provider
      value={{
        aadConfig,
        loading,
      }}
    >
      {loading && <Loading text={'Loading configuration ...'} />}
      {!loading && children}
    </configContext.Provider>
  );
};

export { ConfigProvider, configContext };
