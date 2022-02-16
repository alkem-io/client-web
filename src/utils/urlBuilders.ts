import { AUTH_REQUIRED_PATH, AUTH_LOGIN_PATH, COMMUNITY_ROUTE } from '../models/constants';

export const buildEcoverseUrl = (ecoverseNameId: string) => `/${ecoverseNameId}`;

export const buildChallengeUrl = (ecoverseNameId: string, challengeNameId: string) =>
  buildEcoverseUrl(ecoverseNameId).concat(`/challenges/${challengeNameId}`);

export const buildOpportunityUrl = (ecoverseNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildChallengeUrl(ecoverseNameId, challengeNameId).concat(`/opportunities/${opportunityNameId}`);

export const buildOrganizationUrl = (organizationNameId: string) => `/organization/${organizationNameId}`;

export const buildAdminEcoverseUrl = (ecoverseNameId: string) => `/admin/hubs/${ecoverseNameId}`;

export const buildAdminChallengeUrl = (ecoverseNameId: string, challengeNameId: string) =>
  buildAdminEcoverseUrl(ecoverseNameId).concat(`/challenges/${challengeNameId}`);

export const buildAdminOpportunityUrl = (ecoverseNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildAdminChallengeUrl(ecoverseNameId, challengeNameId).concat(`/opportunities/${opportunityNameId}`);

export const buildAdminOrganizationUrl = (organizationNameId: string) => `/admin/organizations/${organizationNameId}`;

export const buildEcoverseCommunityUrl = (ecoverseNameId: string) =>
  buildEcoverseUrl(ecoverseNameId).concat(COMMUNITY_ROUTE);
export const buildChallengeCommunityUrl = (ecoverseNameId: string, challengeNameId: string) =>
  buildChallengeUrl(ecoverseNameId, challengeNameId).concat(COMMUNITY_ROUTE);
export const buildOpportunityCommunityUrl = (
  ecoverseNameId: string,
  challengeNameId: string,
  opportunityNameId: string
) => buildOpportunityUrl(ecoverseNameId, challengeNameId, opportunityNameId).concat(COMMUNITY_ROUTE);

export const buildUserProfileUrl = (userNameId: string) => `/user/${userNameId}`;

export const buildAuthenticationRequiredURL = (returnUrl?: string) =>
  returnUrl ? `${AUTH_REQUIRED_PATH}?returnUrl=${encodeURI(returnUrl)}` : AUTH_REQUIRED_PATH;

export const buildLoginUrl = (returnUrl?: string) =>
  returnUrl ? `${AUTH_LOGIN_PATH}?returnUrl=${encodeURI(returnUrl)}` : AUTH_LOGIN_PATH;

export const buildEcoverseApplyUrl = (ecoverseNameId: string) => `${buildEcoverseUrl(ecoverseNameId)}/apply`;

export const buildChallengeApplyUrl = (ecoverseNameId: string, challengeNameId: string) =>
  `${buildChallengeUrl(ecoverseNameId, challengeNameId)}/apply`;

export const buildProjectUrl = (
  ecoverseNameId: string,
  challengeNameId: string,
  opportunityNameId: string,
  projectNameId: string
) => `${buildOpportunityUrl(ecoverseNameId, challengeNameId, opportunityNameId)}/projects/${projectNameId}`;

export const buildDiscussionUrl = (url: string, id: string) => {
  const stripUrl = url.replace('/discussions', '');
  return `${stripUrl}/discussions/${id}`;
};

export const buildDiscussionsUrl = (url: string) => {
  const stripUrl = url.replace('/discussions', '');
  return `${stripUrl}/discussions/`;
};

export const buildNewDiscussionUrl = (url: string) => {
  const stripUrl = url.replace('/discussions', '');
  return `${stripUrl}/discussions/new`;
};

export const buildAspectUrl = (
  aspectNameId: string,
  ecoverseNameId: string,
  challengeNameId?: string,
  opportunityNameId?: string
) => {
  if (challengeNameId) {
    if (opportunityNameId) {
      return `${buildOpportunityUrl(ecoverseNameId, challengeNameId, opportunityNameId)}/aspects/${aspectNameId}`;
    } else {
      return `${buildChallengeUrl(ecoverseNameId, challengeNameId)}/aspects/${aspectNameId}`;
    }
  } else {
    return `${buildEcoverseUrl(ecoverseNameId)}/aspects/${aspectNameId}`;
  }
};
