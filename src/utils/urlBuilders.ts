import { AUTH_REQUIRED_PATH, AUTH_LOGIN_PATH } from '../models/constants';

export const buildEcoverseUrl = (ecoverseNameId: string) => `/${ecoverseNameId}`;

export const buildChallengeUrl = (ecoverseNameId: string, challengeNameId: string) =>
  buildEcoverseUrl(ecoverseNameId).concat(`/challenges/${challengeNameId}`);

export const buildOpportunityUrl = (ecoverseNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildChallengeUrl(ecoverseNameId, challengeNameId).concat(`/opportunities/${opportunityNameId}`);

export const buildOrganizationUrl = (organizationNameId: string) => `/organization/${organizationNameId}`;

export const buildAdminEcoverseUrl = (ecoverseNameId: string) => `/admin/ecoverses/${ecoverseNameId}`;

export const buildAdminChallengeUrl = (ecoverseNameId: string, challengeNameId: string) =>
  buildAdminEcoverseUrl(ecoverseNameId).concat(`/challenges/${challengeNameId}`);

export const buildAdminOpportunityUrl = (ecoverseNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildAdminChallengeUrl(ecoverseNameId, challengeNameId).concat(`/opportunities/${opportunityNameId}`);

export const buildAdminOrganizationUrl = (organizationNameId: string) => `/admin/organizations/${organizationNameId}`;

export const buildUserProfileUrl = (userNameId: string) => `/user/${userNameId}`;

export const buildAuthenticationRequiredURL = (returnUrl?: string) =>
  returnUrl ? `${AUTH_REQUIRED_PATH}?returnUrl=${encodeURI(returnUrl)}` : AUTH_REQUIRED_PATH;

export const buildLoginUrl = (returnUrl?: string) =>
  returnUrl ? `${AUTH_LOGIN_PATH}?returnUrl=${encodeURI(returnUrl)}` : AUTH_LOGIN_PATH;

export const buildEcoverseApplyUrl = (ecoverseNameId: string) => `${buildEcoverseUrl(ecoverseNameId)}/apply`;

export const buildChallengeApplyUrl = (ecoverseNameId: string, challengeNameId) =>
  `${buildChallengeUrl(ecoverseNameId, challengeNameId)}/apply`;
