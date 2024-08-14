import { _AUTH_LOGIN_PATH } from '../../core/auth/authentication/constants/authentication.constants';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';
import { ROUTE_HOME } from '../../domain/platform/routes/constants';
import { isAbsoluteUrl } from '../../core/utils/links';
import { TopLevelRoutePath } from './TopLevelRoutePath';

export const buildOrganizationUrl = (organizationNameId: string) => `/organization/${organizationNameId}`;

export const buildVirtualContributorUrl = (virtualContributorNameId: string) => `/vc/${virtualContributorNameId}`;

export const buildSettingsUrl = (entityUrl: string) => {
  return `${entityUrl}/settings`;
};

export const buildSettingsProfileUrl = (entityUrl: string) => {
  return `${entityUrl}/settings/profile`;
};

export const buildUserProfileUrl = (userNameId: string) => `/user/${userNameId}`;

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

export const buildInnovationPackUrl = (innovationPackNameId: string) =>
  `/${TopLevelRoutePath.InnovationPacks}/${innovationPackNameId}`;

export const buildInnovationPackSettingsUrl = buildSettingsUrl;

export const buildInnovationHubUrl = (subdomain: string): string => {
  if (!window || !window.location) {
    throw new Error("Couldn't determine the base URL");
  }

  if (import.meta.env.MODE === 'development') {
    // For localhost return always the base URL
    if (subdomain) {
      return `${window.location.origin}?subdomain=${subdomain}`;
    } else {
      return window.location.origin;
    }
  } else {
    // get the last 2 parts of the hostname: ['xx-alkem', 'io']
    const url = window.location;
    const domain = url.hostname.split('.').slice(-2);
    if (subdomain) {
      return `${url.protocol}//${subdomain}.${domain.join('.')}`;
    } else {
      return `${url.protocol}//${domain.join('.')}`;
    }
  }
};
