import { _AUTH_LOGIN_PATH, AUTH_SIGN_UP_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import { isAbsoluteUrl } from '@/core/utils/links';
import { DIALOG_PARAM_VALUES } from '@/main/topLevelPages/myDashboard/useMyDashboardDialogs';

export const KNOWLEDGE_BASE_PATH = 'knowledge-base';

// Keep these in sync with the consts in TabbedLayoutPage.tsx and don't import,
// tests fail to import because they are in different modules
const URL_PARAM_SECTION = 'tab';
const URL_PARAM_DIALOG = 'dialog';

export enum TabbedLayoutParams {
  Section = URL_PARAM_SECTION,
  Dialog = URL_PARAM_DIALOG,
}

export const buildSettingsUrl = (entityUrl: string) => {
  return `${entityUrl}/settings`;
};

export const buildSettingsCommunityUrl = (entityUrl: string) => {
  return `${buildSettingsUrl(entityUrl)}/community`;
};

export const buildVCKnowledgeBaseUrl = (vcUrl: string = '.') => `${vcUrl}/${KNOWLEDGE_BASE_PATH}`;

export const buildReturnUrlParam = (returnUrl = ROUTE_HOME, origin = window.location.origin) => {
  const fullReturnUrl = isAbsoluteUrl(returnUrl) ? returnUrl : `${origin}${returnUrl}`;
  return `?returnUrl=${encodeURI(fullReturnUrl)}`;
};

export const hasReturnUrlParam = (params?: string) => params && params.includes('returnUrl=');

export const buildLoginUrl = (returnUrl?: string, params?: string) => {
  if (hasReturnUrlParam(params)) {
    return `${_AUTH_LOGIN_PATH}${params}`;
  }

  return `${_AUTH_LOGIN_PATH}${buildReturnUrlParam(returnUrl)}`;
};

export const buildSignUpUrl = (returnUrl?: string, params?: string) => {
  if (hasReturnUrlParam(params)) {
    return `${AUTH_SIGN_UP_PATH}${params}`;
  }

  return `${AUTH_SIGN_UP_PATH}${buildReturnUrlParam(returnUrl)}${params ? params : ''}`;
};

export const buildUpdatesUrl = (spaceUrl: string) => {
  return `${spaceUrl}/updates`;
};

export const buildSpaceSectionUrl = (
  spaceUrl: string = '',
  sectionNumber: number = 0,
  dialog: string | undefined = undefined
) => {
  let result = '';
  const params = new URLSearchParams(window.location.search);

  try {
    const url = new URL(spaceUrl); // Parse the URL and extract the pathname if it's absolute
    result = url.pathname;
  } catch {
    result = spaceUrl; // If the URL is not absolute, use it as is
  }

  if (sectionNumber) {
    params.set(URL_PARAM_SECTION, sectionNumber.toString());
  }
  if (dialog) {
    params.set(URL_PARAM_DIALOG, dialog);
  } else {
    params.delete(URL_PARAM_DIALOG);
  }

  return `${result}?${params.toString()}`;
};

export const buildInnovationPackSettingsUrl = buildSettingsUrl;

export const buildInnovationHubUrl = (subdomain: string): string => {
  if (!window || !window.location) {
    throw new Error("Couldn't determine the base URL");
  }

  const { hostname, protocol, origin } = window.location;
  if (import.meta.env.MODE === 'development') {
    // For localhost return always the base URL
    if (subdomain) {
      return `${origin}/?subdomain=${subdomain}`;
    } else {
      return origin;
    }
  } else {
    // get the last 2 parts of the hostname: ['xx-alkem', 'io']
    const domain = hostname.split('.').slice(-2);
    if (subdomain) {
      return `${protocol}//${subdomain}.${domain.join('.')}`;
    } else {
      return `${protocol}//${domain.join('.')}`;
    }
  }
};

export const buildUserAccountUrl = (profileUrl?: string) => {
  return profileUrl ? `${buildSettingsUrl(profileUrl)}/account` : '';
};

export const buildWelcomeSpaceUrl = () => '/welcome-space';

export const getInvitationsDialogUrl = () => `/home?${URL_PARAM_DIALOG}=${DIALOG_PARAM_VALUES.INVITATIONS}`;

const VIDEO_CALL_BASE_URL = 'https://meet.jit.si/';

export const buildVideoCallUrl = (storageAggregatorId: string, spaceNameId?: string) => {
  // Use spaceNameId if available for better readability, otherwise use storageAggregatorId only
  // storageAggregatorId is behind authorization, so unauthorized users cannot access the video call URL
  const meetingIdentifier = spaceNameId
    ? `${spaceNameId}-${encodeURIComponent(storageAggregatorId)}`
    : encodeURIComponent(storageAggregatorId);
  return `${VIDEO_CALL_BASE_URL}${meetingIdentifier}`;
};
