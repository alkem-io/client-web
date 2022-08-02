import { AUTH_REQUIRED_PATH, AUTH_LOGIN_PATH, COMMUNITY_ROUTE } from '../models/constants';

export const buildHubUrl = (hubNameId: string) => `/${hubNameId}`;

export const buildChallengeUrl = (hubNameId: string, challengeNameId: string) =>
  buildHubUrl(hubNameId).concat(`/challenges/${challengeNameId}`);

export const buildOpportunityUrl = (hubNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildChallengeUrl(hubNameId, challengeNameId).concat(`/opportunities/${opportunityNameId}`);

export const buildOrganizationUrl = (organizationNameId: string) => `/organization/${organizationNameId}`;

export const buildAdminHubUrl = (hubNameId: string) => `/admin/hubs/${hubNameId}`;

export const buildAdminChallengeUrl = (hubNameId: string, challengeNameId: string) =>
  buildAdminHubUrl(hubNameId).concat(`/challenges/${challengeNameId}`);

export const buildAdminOpportunityUrl = (hubNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildAdminChallengeUrl(hubNameId, challengeNameId).concat(`/opportunities/${opportunityNameId}`);

export const buildAdminOrganizationUrl = (organizationNameId: string) => `/admin/organizations/${organizationNameId}`;

export const buildHubCommunityUrl = (hubNameId: string) => buildHubUrl(hubNameId).concat(COMMUNITY_ROUTE);
export const buildChallengeCommunityUrl = (hubNameId: string, challengeNameId: string) =>
  buildChallengeUrl(hubNameId, challengeNameId).concat(COMMUNITY_ROUTE);
export const buildOpportunityCommunityUrl = (hubNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId).concat(COMMUNITY_ROUTE);

export const buildUserProfileUrl = (userNameId: string) => `/user/${userNameId}`;

export const buildAuthenticationRequiredURL = (returnUrl?: string) =>
  returnUrl ? `${AUTH_REQUIRED_PATH}?returnUrl=${encodeURI(returnUrl)}` : AUTH_REQUIRED_PATH;

export const buildLoginUrl = (returnUrl?: string) =>
  returnUrl ? `${AUTH_LOGIN_PATH}?returnUrl=${encodeURI(returnUrl)}` : AUTH_LOGIN_PATH;

export const buildHubApplyUrl = (hubNameId: string) => `${buildHubUrl(hubNameId)}/apply`;

export const buildChallengeApplyUrl = (hubNameId: string, challengeNameId: string) =>
  `${buildChallengeUrl(hubNameId, challengeNameId)}/apply`;

export const buildProjectUrl = (
  hubNameId: string,
  challengeNameId: string,
  opportunityNameId: string,
  projectNameId: string
) => `${buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId)}/projects/${projectNameId}`;

export const buildDiscussionUrl = (url: string, id: string) => {
  const stripUrl = url.replaceAll(/\/discussions|\/new/g, '');
  return `${stripUrl}/discussions/${id}`;
};

export const buildDiscussionsUrl = (url: string) => {
  const stripUrl = url.replace(/\/discussions\/.*/g, '');
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
  const aspectUrl = `/contribute/aspects/${aspectNameId}`;
  if (challengeNameId) {
    if (opportunityNameId) {
      return `${buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId)}${aspectUrl}`;
    } else {
      return `${buildChallengeUrl(hubNameId, challengeNameId)}${aspectUrl}`;
    }
  } else {
    return `${buildHubUrl(hubNameId)}${aspectUrl}`;
  }
};

export const buildCanvasUrl = (
  canvasNameId: string,
  hubNameId: string,
  challengeNameId?: string,
  opportunityNameId?: string
) => {
  const canvasUrl = `/canvases/${canvasNameId}`;
  if (challengeNameId) {
    if (opportunityNameId) {
      return `${buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId)}${canvasUrl}`;
    } else {
      return `${buildChallengeUrl(hubNameId, challengeNameId)}${canvasUrl}`;
    }
  } else {
    return `${buildHubUrl(hubNameId)}${canvasUrl}`;
  }
};
