import { _AUTH_LOGIN_PATH } from '../../core/auth/authentication/constants/authentication.constants';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';
import { ROUTE_HOME } from '../../domain/platform/routes/constants';
import { isAbsoluteUrl, normalizeLink } from '../../core/utils/links';

export const buildOrganizationUrl = (organizationNameId: string) => `/organization/${organizationNameId}`;

export const buildJourneyAdminUrl = (journeyProfileUrl: string) => {
  const relativeUrl = normalizeLink(journeyProfileUrl);
  return `/admin/spaces/${relativeUrl.replace(/^\//, '')}`;
};

export const buildAdminOrganizationUrl = (organizationNameId: string) => `/admin/organizations/${organizationNameId}`;

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
