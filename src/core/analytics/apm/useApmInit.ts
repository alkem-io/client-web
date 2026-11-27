import { init as initApm } from '@elastic/apm-rum';
// TODO Refactor to store data in localStorage, remove react-cookie npm
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { v4 as uuidv4 } from 'uuid';
import { appPlatform, isAppMode } from '@/core/appMode/isAppMode';
import type { CurrentUserModel } from '@/domain/community/userCurrent/model/CurrentUserModel';
import { useConfig } from '@/domain/platform/config/useConfig';
import { APM_COOKIE_NAME, apmCookieOptions, useAlkemioCookies } from '@/main/cookies/useAlkemioCookies';

const APM_CLIENT_TRACK_COOKIE_VALUE_PREFIX = 'apm';
const APM_CLIENT_SERVICE_NAME = 'alkemio-client-web';
const APM_ORIENTATION_TYPE_NOT_SUPPORTED = 'orientation type not supported on this device';

export interface ApmCustomContext {
  authenticated?: boolean;
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

// Only the fields we analyse: the user is the random `apm` id, never the platform user, their
// email domain or their location.
export const useApmInit = (user: CurrentUserModel | undefined) => {
  const apmId = useGetOrSetApmCookie();
  const { apm: apmConfig, locations } = useConfig();

  const rumEnabled = apmConfig?.rumEnabled ?? false;
  const endpoint = apmConfig?.endpoint;
  const environment = locations?.environment;
  // prevent console errors in dev mode
  const isInitAllowed = import.meta.env.MODE === 'production';

  // Returns the agent only when it starts, so "an agent exists" means "RUM runs in this page".
  return () => {
    if (!apmId || !rumEnabled || !endpoint || !environment || !isInitAllowed) {
      return undefined;
    }

    const apmInit = initApm({
      serviceName: APM_CLIENT_SERVICE_NAME,
      serverUrl: endpoint,
      serviceVersion: import.meta.env.VITE_VERSION,
      environment,
    });

    apmInit.setUserContext({ id: apmId });
    apmInit.setCustomContext(getCustomContext(user));
    apmInit.addLabels({ app_mode: isAppMode(), app_platform: appPlatform() });

    return apmInit;
  };
};

export const useGetOrSetApmCookie = (): string | undefined => {
  // TODO Refactor to store data in localStorage, remove react-cookie npm
  const [cookies, setCookie] = useCookies([APM_COOKIE_NAME]);
  // Consent first: an existing id is never used for a visitor without analysis consent.
  const { consent } = useAlkemioCookies();

  const cookieId: string | undefined = cookies[APM_COOKIE_NAME];

  // Minted in an effect: writing a cookie notifies every subscriber, which must not happen while
  // rendering. The id arrives on the next render, and the agent waits for it.
  useEffect(() => {
    if (consent.analysis && !cookieId) {
      setCookie(APM_COOKIE_NAME, `${APM_CLIENT_TRACK_COOKIE_VALUE_PREFIX}-${uuidv4()}`, apmCookieOptions());
    }
  }, [consent.analysis, cookieId, setCookie]);

  return consent.analysis ? cookieId : undefined;
};

const getCustomContext = (user: CurrentUserModel | undefined): ApmCustomContext => ({
  authenticated: user?.isAuthenticated,
  screen: getScreenInfo(),
  window: getWindowSize(),
  language: getLanguage(),
});

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
