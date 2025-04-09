import { _AUTH_LOGIN_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import { isAbsoluteUrl } from '@/core/utils/links';

export const KNOWLEDGE_BASE_PATH = 'knowledge-base';

// Keep these in sync with the consts in TabbedLayoutPage.tsx and don't import,
// tests fail to import because they are in different modules
const URL_PARAM_SECTION = 'tab';
const URL_PARAM_DIALOG = 'dialog';

export const buildSettingsUrl = (entityUrl: string) => {
  return `${entityUrl}/settings`;
};

export const buildVCKnowledgeBaseUrl = (vcUrl: string = '.') => `${vcUrl}/${KNOWLEDGE_BASE_PATH}`;

export const buildReturnUrlParam = (returnUrl = ROUTE_HOME, origin = window.location.origin) => {
  const fullReturnUrl = isAbsoluteUrl(returnUrl) ? returnUrl : `${origin}${returnUrl}`;
  return `?returnUrl=${encodeURI(fullReturnUrl)}`;
};

export const buildLoginUrl = (returnUrl?: string) => {
  return `${_AUTH_LOGIN_PATH}${buildReturnUrlParam(returnUrl)}`;
};

export const buildNewOrganizationUrl = () => {
  return '/admin/organizations/new';
};

export const buildUpdatesUrl = (journeyLocation: string) => {
  return `${journeyLocation}?dialog=updates`;
};

export const buildUpdatesUrlLegacy = (journeyLocation: string) => {
  return `${journeyLocation}/updates`;
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

export const getAccountLink = (profileUrl?: string) => {
  return profileUrl ? `${profileUrl}/settings/account` : '';
};

export const buildWelcomeSpaceUrl = () => '/welcome-space';
