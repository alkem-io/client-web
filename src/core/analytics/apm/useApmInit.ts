import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { init as initApm, UserObject } from '@elastic/apm-rum';
// TODO Refactor to store data in localStorage, remove react-cookie npm
import { useCookies } from 'react-cookie';
import { error as logError } from '@/core/logging/sentry/log';
import { useConfig } from '@/domain/platform/config/useConfig';
import { ALKEMIO_COOKIE_NAME, AlkemioCookieTypes } from '@/main/cookies/useAlkemioCookies';
import { useUserGeo } from '@/core/analytics/geo';
import { Identifiable } from '@/core/utils/Identifiable';
import { CurrentUserModel } from '@/domain/community/userCurrent/model/CurrentUserModel';

const APM_CLIENT_TRACK_COOKIE = 'apm';
const APM_CLIENT_TRACK_COOKIE_EXPIRY = 2147483647 * 1000; // Y2k38 -> 2^31 - 1 = 2147483647 ie. 2038-01-19 04:14:07
const APM_CLIENT_TRACK_COOKIE_VALUE_PREFIX = 'apm';
const APM_CLIENT_TRACK_COOKIE_VALUE_NOT_TRACKED = 'not-tracked';
const APM_CLIENT_SERVICE_NAME = 'alkemio-client-web';
const APM_ORIENTATION_TYPE_NOT_SUPPORTED = 'orientation type not supported on this device';

export interface ApmCustomContext {
  authenticated?: boolean;
  ip?: string;
  location?: {
    lat?: number;
    lon?: number;
  };
  domain?: string;
  screen?: {
    width: number;
    height: number;
    orientation: OrientationType | typeof APM_ORIENTATION_TYPE_NOT_SUPPORTED;
  };
  window?: {
    width: number;
    height: number;
  };
  language?: string;
}

export const useApmInit = (user: CurrentUserModel | undefined) => {
  const userObject = useUserObject(user?.userModel);
  const customContext = useCustomContext(user);
  const { apm: apmConfig, locations } = useConfig();

  const rumEnabled = apmConfig?.rumEnabled ?? false;
  const endpoint = apmConfig?.endpoint;
  const environment = locations?.environment;
  // prevent console errors in dev mode
  const isInitAllowed = import.meta.env.MODE === 'production';

  return useCallback(() => {
    if (!endpoint || !environment || !isInitAllowed) {
      return undefined;
    }

    const enabled = (rumEnabled && !!endpoint) ?? false;

    const apmInit = initApm({
      serviceName: APM_CLIENT_SERVICE_NAME,
      serverUrl: endpoint,
      serviceVersion: import.meta.env.VITE_APP_VERSION,
      environment,
      active: enabled,
    });

    apmInit.setUserContext(userObject);
    apmInit.setCustomContext(customContext);

    return apmInit;
  }, [endpoint, rumEnabled, environment, userObject, customContext]);
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

const useUserObject = (user: Identifiable | undefined) => {
  const cookieId = useGetOrSetApmCookie() ?? APM_CLIENT_TRACK_COOKIE_VALUE_NOT_TRACKED;

  return useMemo<UserObject>(() => {
    if (user) {
      return { id: user.id };
    }

    return { id: cookieId };
  }, [user?.id, cookieId]);
};
const useCustomContext = (user: CurrentUserModel | undefined) => {
  const { data: userGeoData, loading: userGeoLoading, error: userGeoError } = useUserGeo();

  return useMemo<ApmCustomContext>(() => {
    const context: ApmCustomContext = {};

    if (!userGeoLoading) {
      context.location = {
        lat: userGeoData?.latitude ?? 0,
        lon: userGeoData?.longitude ?? 0,
      };
    }

    if (userGeoError) {
      logError(userGeoError);
    }

    if (user) {
      context.authenticated = user.isAuthenticated;
      context.domain = user.userModel?.email.split('@')?.[1];
    }

    context.screen = getScreenInfo();
    context.window = getWindowSize();
    context.language = getLanguage();

    return context;
  }, [userGeoData, userGeoLoading, userGeoError, user, getWindowSize, getScreenInfo]);
};

const getWindowSize = () => {
  const body = document.getElementsByTagName('body')[0];
  const width = window.innerWidth || document.documentElement.clientWidth || body.clientWidth;
  const height = window.innerHeight || document.documentElement.clientHeight || body.clientHeight;

  return { width, height };
};

const getScreenInfo = () => {
  const { width, height, orientation } = window.screen;
  const orientationType: OrientationType = orientation?.type ?? APM_ORIENTATION_TYPE_NOT_SUPPORTED;

  return { width, height, orientation: orientationType };
};

const getLanguage = () => {
  return navigator.language;
};
