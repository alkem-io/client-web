import { useEffect, useMemo, useState } from 'react';
import { ApmBase, init as initApm } from '@elastic/apm-rum';
import { useConfig, useUserContext } from './index';

const APM_CLIENT_SERVICE_NAME = 'alkemio-client-web';
const APM_DEFAULT_ENVIRONMENT = 'local';

export const useApm = (): ApmBase | undefined => {
  const { user: userMetadata, isAuthenticated, loading } = useUserContext();
  const user = userMetadata?.user;
  const userObject = useMemo(
    () =>
      !loading && isAuthenticated && !!user
        ? {
            id: user.id,
            email: user.email,
            username: user.displayName,
          }
        : {},
    [isAuthenticated, loading, user]
  );

  const { apm: apmConfig } = useConfig();
  const rumEnabled = apmConfig?.rumEnabled ?? false;
  const endpoint = apmConfig?.endpoint ?? '';
  const [apm, setApm] = useState<ApmBase | undefined>();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!endpoint) {
      return;
    }

    const enabled = (rumEnabled && !!endpoint) ?? false;

    const apmInit = initApm({
      serviceName: APM_CLIENT_SERVICE_NAME,
      serverUrl: endpoint,
      serviceVersion: require('../../package.json').version,
      environment: process.env.NODE_ENV ?? APM_DEFAULT_ENVIRONMENT,
      active: enabled,
    });

    apmInit.setUserContext(userObject);

    setApm(apmInit);
  }, [loading, endpoint, rumEnabled, userObject]);

  return apm;
};
