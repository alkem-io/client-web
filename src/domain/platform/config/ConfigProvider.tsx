import { ConfigurationDocument } from '@/core/apollo/generated/apollo-hooks';
import { ConfigurationQuery, Metadata } from '@/core/apollo/generated/graphql-schema';
import queryRequest from '@/core/http/queryRequest';
import { TagCategoryValues, warn as logWarn } from '@/core/logging/sentry/log';
import Loading from '@/core/ui/loading/Loading';
import useLoadingStateWithHandlers from '@/domain/shared/utils/useLoadingStateWithHandlers';
import { ApolloError } from '@apollo/client';
import React, { FC, PropsWithChildren, useEffect, useState } from 'react';
import { Configuration } from './configuration';

export interface ConfigContextProps {
  config?: Configuration;
  serverMetadata: Metadata;
  loading: boolean;
  error?: ApolloError;
}

interface ConfigProviderProps extends PropsWithChildren {
  url: string;
}

const ConfigContext = React.createContext<ConfigContextProps>({
  config: undefined,
  serverMetadata: { services: [] },
  loading: false,
  error: undefined,
});

const ConfigProvider: FC<ConfigProviderProps> = ({ children, url }) => {
  const [config, setConfig] = useState<Configuration | undefined>();
  const [serverMetadata, setServerMetadata] = useState<Metadata>({ services: [] });

  const [requestConfig, loading, error] = useLoadingStateWithHandlers(
    async (url: string) => {
      const result = await queryRequest<ConfigurationQuery>(url, ConfigurationDocument);
      const platformConfiguration = result.data.data.platform.configuration;
      const settings = result.data.data.platform.settings;
      const combinedConfiguration: Configuration = {
        ...platformConfiguration,
        ...settings,
      };

      setConfig(combinedConfiguration);
      setServerMetadata(result.data.data.platform.metadata);
    },
    {
      onError: err => logWarn(err, { category: TagCategoryValues.CONFIG }),
    }
  );

  useEffect(() => {
    requestConfig(url);
  }, [url]);

  if (loading || (!config && !error)) {
    return <Loading text={'Loading configuration ...'} />;
  }

  return (
    <ConfigContext
      value={{
        config,
        serverMetadata,
        loading,
        error: error && new ApolloError({ errorMessage: error.message }),
      }}
    >
      {children}
    </ConfigContext>
  );
};

export { ConfigContext, ConfigProvider };
