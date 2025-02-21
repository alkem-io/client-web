import { useContext, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import { ConfigContext } from './ConfigProvider';
import { Configuration } from './configuration';
import { Metadata } from '@/core/apollo/generated/graphql-schema';

type ConfigReturnType = Partial<Configuration> & {
  serverMetadata: Metadata;
} & {
  isFeatureEnabled: (name: string) => boolean;
  loading: boolean;
  error?: ApolloError;
};

export const useConfig = () => {
  const context = useContext(ConfigContext);

  return useMemo<ConfigReturnType>(
    () => ({
      authentication: context.config?.authentication,
      locations: context.config?.locations,
      features: context.config?.featureFlags,
      integration: context.config?.integration,
      sentry: context.config?.sentry,
      apm: context.config?.apm,
      geo: context.config?.geo,
      serverMetadata: context.serverMetadata,
      loading: context.loading,
      error: context.error,
      isFeatureEnabled: (name: string) => context.config?.featureFlags.find(x => x.name === name)?.enabled || false,
    }),
    [context]
  );
};
