import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ApmBase, init as initApm, UserObject } from '@elastic/apm-rum';
// TODO Refactor to store data in localStorage, remove react-cookie npm
import { useCookies } from 'react-cookie';
import { error as logError } from '../../services/logging/sentry/log';
import { useUserContext } from '../../domain/community/contributor/user';
import { useConfig } from '../../domain/platform/config/useConfig';
import { useUserGeo } from '../../domain/community/contributor/user/hooks/useUserGeo';
import { ALKEMIO_COOKIE_NAME, AlkemioCookieTypes } from '../../domain/platform/cookies/useAlkemioCookies';

const APM_CLIENT_TRACK_COOKIE = 'apm';
const APM_CLIENT_TRACK_COOKIE_EXPIRY = 2147483647 * 1000; // Y2k38 -> 2^31 - 1 = 2147483647 ie. 2038-01-19 04:14:07
const APM_CLIENT_TRACK_COOKIE_VALUE_PREFIX = 'apm';
const APM_CLIENT_TRACK_COOKIE_VALUE_NOT_TRACKED = 'not-tracked';
const APM_CLIENT_SERVICE_NAME = 'alkemio-client-web';

const skipOnLocal = process.env.NODE_ENV !== 'production';

export interface ApmCustomContext {
  authenticated?: boolean;
  ip?: string;
  location?: {
    lat?: number;
    lon?: number;
  };
  domain?: string;
}

export const useApm = (): ApmBase | undefined => {
  const userObject = useUserObject();
  const customContext = useCustomContext();
  const { apm: apmConfig, platform: platformConfig } = useConfig();
  const [apm, setApm] = useState<ApmBase | undefined>();

  const rumEnabled = apmConfig?.rumEnabled ?? false;
  const endpoint = apmConfig?.endpoint;
  const environment = platformConfig?.environment;

  useEffect(() => {
    if (!endpoint || !environment) {
      return;
    }

    const enabled = (rumEnabled && !!endpoint) ?? false;

    const apmInit = initApm({
      serviceName: APM_CLIENT_SERVICE_NAME,
      serverUrl: endpoint,
      serviceVersion: require('../../../package.json').version,
      environment,
      active: enabled,
    });

    apmInit.setUserContext(userObject);
    apmInit.setCustomContext(customContext);

    setApm(apmInit);
  }, [endpoint, rumEnabled, environment, userObject, customContext]);

  return apm;
};

const useGetOrSetApmCookie = (): string | undefined => {
  // TODO Refactor to store data in localStorage, remove react-cookie npm
  const [cookies, setCookie] = useCookies([APM_CLIENT_TRACK_COOKIE, ALKEMIO_COOKIE_NAME]);

  return useMemo(() => {
    const cookieId = cookies[APM_CLIENT_TRACK_COOKIE];

    if (cookieId) {
      return cookieId;
    }
    const acceptedCookies: string = cookies[ALKEMIO_COOKIE_NAME];
    if (!acceptedCookies || !acceptedCookies.includes(AlkemioCookieTypes.analysis)) {
      return undefined;
    }

    const userApmId = `${APM_CLIENT_TRACK_COOKIE_VALUE_PREFIX}-${uuidv4()}`;
    setCookie(APM_CLIENT_TRACK_COOKIE, userApmId, {
      expires: new Date(APM_CLIENT_TRACK_COOKIE_EXPIRY),
      path: '/',
      sameSite: 'strict',
    });

    return userApmId;
  }, [cookies, setCookie]);
};

const useUserObject = () => {
  const { user: userMetadata, isAuthenticated, loading: userLoading } = useUserContext();
  const user = userMetadata?.user;
  const cookieId = useGetOrSetApmCookie() ?? APM_CLIENT_TRACK_COOKIE_VALUE_NOT_TRACKED;

  return useMemo<UserObject>(() => {
    if (userLoading) {
      return {};
    }

    if (isAuthenticated && !!user?.id) {
      return { id: user.id };
    }

    return { id: cookieId };
  }, [isAuthenticated, userLoading, user?.id, cookieId]);
};
const useCustomContext = () => {
  const { user: userMetadata, isAuthenticated, loading: userLoading } = useUserContext();
  const user = userMetadata?.user;

  const { data: userGeoData, loading: userGeoLoading, error: userGeoError } = useUserGeo(skipOnLocal);

  return useMemo<ApmCustomContext>(() => {
    const context: ApmCustomContext = {};

    if (!userGeoLoading) {
      context.location = {
        lat: userGeoData?.latitude,
        lon: userGeoData?.longitude,
      };
    }

    if (userGeoError) {
      logError(userGeoError);
    }

    if (!userLoading) {
      context.authenticated = isAuthenticated;
      context.domain = user?.email?.split('@')?.[1];
    }

    return context;
  }, [userGeoData, userGeoLoading, userGeoError, userLoading, isAuthenticated, user?.email]);
};
