import { _AUTH_LOGIN_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import { isAbsoluteUrl } from '@/core/utils/links';

export const buildOrganizationUrl = (organizationNameId: string) => `/organization/${organizationNameId}`;

export const buildSettingsUrl = (entityUrl: string) => {
  return `${entityUrl}/settings`;
};

export const buildSettingsProfileUrl = (entityUrl: string) => {
  return `${entityUrl}/settings/profile`;
};

export const buildUserProfileUrl = (userNameId: string) => `/user/${userNameId}`;

export const buildVCProfileUrl = (vcNameId: string) => `/vc/${vcNameId}`;

export const buildUserProfileSettingsUrl = (userNameId: string) =>
  `${buildUserProfileUrl(userNameId)}/settings/profile`;

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
  const updatesPath = `/${EntityPageSection.Dashboard}/updates`;
  return `${journeyLocation}${updatesPath}`;
};

export const buildAboutUrl = (journeyLocation: string | undefined) => {
  return journeyLocation && `${journeyLocation}/about`;
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

export const getSpaceUrlFromSubSpace = (subSpaceUrl: string) => {
  const url = new URL(subSpaceUrl, window.location.origin);
  const urlSegments = url.pathname.split('/challenges');

  url.pathname = urlSegments[0];
  return url.href;
};
