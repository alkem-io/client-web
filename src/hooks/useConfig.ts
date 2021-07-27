import { useContext, useMemo } from 'react';
import { configContext } from '../context/ConfigProvider';

export const useConfig = () => {
  const context = useContext(configContext);

  return useMemo(
    () => ({
      authentication: context.config?.authentication,
      platform: context.config?.platform,
      features: context.config?.platform.featureFlags,
      loading: context.loading,
      isFeatureEnabled: (name: string) =>
        context.config?.platform.featureFlags.find(x => x.name === name)?.enabled || false,
    }),
    [context]
  );
};
