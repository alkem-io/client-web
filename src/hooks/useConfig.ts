import { useContext, useMemo } from 'react';
import { ConfigContext } from '../context/ConfigProvider';

export const useConfig = () => {
  const context = useContext(ConfigContext);

  return useMemo(
    () => ({
      authentication: context.config?.authentication,
      platform: context.config?.platform,
      features: context.config?.platform.featureFlags,
      sentry: context.config?.sentry,
      loading: context.loading,
      error: context.error,
      isFeatureEnabled: (name: string) =>
        context.config?.platform.featureFlags.find(x => x.name === name)?.enabled || false,
    }),
    [context]
  );
};
