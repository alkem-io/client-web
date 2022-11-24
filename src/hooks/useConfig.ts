import { useContext, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import { ConfigContext } from '../config/context/ConfigProvider';
import { Configuration } from '../models/configuration';

type ConfigReturnType = Partial<Configuration> & {
  isFeatureEnabled: (name: string) => boolean;
  loading: boolean;
  error?: ApolloError;
};

export const useConfig = () => {
  const context = useContext(ConfigContext);

  return useMemo<ConfigReturnType>(
    () => ({
      authentication: context.config?.authentication,
      platform: context.config?.platform,
      features: context.config?.platform.featureFlags,
      sentry: context.config?.sentry,
      storage: context.config?.storage,
      apm: context.config?.apm,
      loading: context.loading,
      error: context.error,
      isFeatureEnabled: (name: string) =>
        context.config?.platform.featureFlags.find(x => x.name === name)?.enabled || false,
    }),
    [context]
  );
};
