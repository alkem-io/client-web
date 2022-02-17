import { AUTH_REQUIRED_PATH, AUTH_LOGIN_PATH, COMMUNITY_ROUTE } from '../models/constants';

export const buildEcoverseUrl = (hubNameId: string) => `/${hubNameId}`;

export const buildChallengeUrl = (hubNameId: string, challengeNameId: string) =>
  buildEcoverseUrl(hubNameId).concat(`/challenges/${challengeNameId}`);

export const buildOpportunityUrl = (hubNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildChallengeUrl(hubNameId, challengeNameId).concat(`/opportunities/${opportunityNameId}`);

export const buildOrganizationUrl = (organizationNameId: string) => `/organization/${organizationNameId}`;

export const buildAdminEcoverseUrl = (hubNameId: string) => `/admin/hubs/${hubNameId}`;

export const buildAdminChallengeUrl = (hubNameId: string, challengeNameId: string) =>
  buildAdminEcoverseUrl(hubNameId).concat(`/challenges/${challengeNameId}`);

export const buildAdminOpportunityUrl = (hubNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildAdminChallengeUrl(hubNameId, challengeNameId).concat(`/opportunities/${opportunityNameId}`);

export const buildAdminOrganizationUrl = (organizationNameId: string) => `/admin/organizations/${organizationNameId}`;

export const buildEcoverseCommunityUrl = (hubNameId: string) => buildEcoverseUrl(hubNameId).concat(COMMUNITY_ROUTE);
export const buildChallengeCommunityUrl = (hubNameId: string, challengeNameId: string) =>
  buildChallengeUrl(hubNameId, challengeNameId).concat(COMMUNITY_ROUTE);
export const buildOpportunityCommunityUrl = (hubNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId).concat(COMMUNITY_ROUTE);

export const buildUserProfileUrl = (userNameId: string) => `/user/${userNameId}`;

export const buildAuthenticationRequiredURL = (returnUrl?: string) =>
  returnUrl ? `${AUTH_REQUIRED_PATH}?returnUrl=${encodeURI(returnUrl)}` : AUTH_REQUIRED_PATH;

export const buildLoginUrl = (returnUrl?: string) =>
  returnUrl ? `${AUTH_LOGIN_PATH}?returnUrl=${encodeURI(returnUrl)}` : AUTH_LOGIN_PATH;

export const buildEcoverseApplyUrl = (hubNameId: string) => `${buildEcoverseUrl(hubNameId)}/apply`;

export const buildChallengeApplyUrl = (hubNameId: string, challengeNameId: string) =>
  `${buildChallengeUrl(hubNameId, challengeNameId)}/apply`;

export const buildProjectUrl = (
  hubNameId: string,
  challengeNameId: string,
  opportunityNameId: string,
  projectNameId: string
) => `${buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId)}/projects/${projectNameId}`;

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

export const buildNewOrganizationUrl = () => {
  return '/admin/organizations/new';
};

export const buildAspectUrl = (
  aspectNameId: string,
  hubNameId: string,
  challengeNameId?: string,
  opportunityNameId?: string
) => {
  if (challengeNameId) {
    if (opportunityNameId) {
      return `${buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId)}/aspects/${aspectNameId}`;
    } else {
      return `${buildChallengeUrl(hubNameId, challengeNameId)}/aspects/${aspectNameId}`;
    }
  } else {
    return `${buildEcoverseUrl(hubNameId)}/aspects/${aspectNameId}`;
  }
};
