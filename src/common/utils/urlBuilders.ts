import { AUTH_REQUIRED_PATH, AUTH_LOGIN_PATH } from '../../models/constants';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';

export const buildHubUrl = (hubNameId: string) => `/${hubNameId}`;

export const buildChallengeUrl = (hubNameId: string, challengeNameId: string) =>
  buildHubUrl(hubNameId).concat(`/challenges/${challengeNameId}`);

export const buildOpportunityUrl = (hubNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildChallengeUrl(hubNameId, challengeNameId).concat(`/opportunities/${opportunityNameId}`);

export const buildOrganizationUrl = (organizationNameId: string) => `/organization/${organizationNameId}`;

export const buildAdminHubUrl = (hubNameId: string) => `/admin/hubs/${hubNameId}`;

export const buildAdminChallengeUrl = (hubNameId: string, challengeNameId: string) =>
  buildAdminHubUrl(hubNameId).concat(`/challenges/${challengeNameId}`);

export const buildAdminNewChallengeUrl = (hubNameId: string) => buildAdminHubUrl(hubNameId).concat('/challenges/new');

export const buildAdminOpportunityUrl = (hubNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildAdminChallengeUrl(hubNameId, challengeNameId).concat(`/opportunities/${opportunityNameId}`);

export const buildAdminNewOpportunityUrl = (hubNameId: string, challengeNameId: string) =>
  buildAdminChallengeUrl(hubNameId, challengeNameId).concat('/opportunities/new');

export const buildAdminOrganizationUrl = (organizationNameId: string) => `/admin/organizations/${organizationNameId}`;

export const buildUserProfileUrl = (userNameId: string) => `/user/${userNameId}`;
export const buildUserProfileSettingsUrl = (userNameId: string) =>
  `${buildUserProfileUrl(userNameId)}/settings/profile`;

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

export interface JourneyLocation {
  hubNameId: string;
  challengeNameId?: string;
  opportunityNameId?: string;
}

export const buildCalloutUrl = (calloutNameId: string, journeyLocation: JourneyLocation) => {
  const calloutUrl = `/${EntityPageSection.Explore}/callouts/${calloutNameId}`;
  if (journeyLocation.challengeNameId) {
    if (journeyLocation.opportunityNameId) {
      return `${buildOpportunityUrl(
        journeyLocation.hubNameId,
        journeyLocation.challengeNameId,
        journeyLocation.opportunityNameId
      )}${calloutUrl}`;
    } else {
      return `${buildChallengeUrl(journeyLocation.hubNameId, journeyLocation.challengeNameId)}${calloutUrl}`;
    }
  } else {
    return `${buildHubUrl(journeyLocation.hubNameId)}${calloutUrl}`;
  }
};

export const buildAspectUrl = (calloutNameId: string, aspectNameId: string, journeyLocation: JourneyLocation) => {
  const aspectUrl = `/${EntityPageSection.Explore}/callouts/${calloutNameId}/aspects/${aspectNameId}`;
  if (journeyLocation.challengeNameId) {
    if (journeyLocation.opportunityNameId) {
      return `${buildOpportunityUrl(
        journeyLocation.hubNameId,
        journeyLocation.challengeNameId,
        journeyLocation.opportunityNameId
      )}${aspectUrl}`;
    } else {
      return `${buildChallengeUrl(journeyLocation.hubNameId, journeyLocation.challengeNameId)}${aspectUrl}`;
    }
  } else {
    return `${buildHubUrl(journeyLocation.hubNameId)}${aspectUrl}`;
  }
};

export const buildCanvasUrl = (calloutNameId: string, canvasNameId: string, journeyLocation: JourneyLocation) => {
  const canvasUrl = `/${EntityPageSection.Explore}/callouts/${calloutNameId}/canvases/${canvasNameId}`;
  if (journeyLocation.challengeNameId) {
    if (journeyLocation.opportunityNameId) {
      return `${buildOpportunityUrl(
        journeyLocation.hubNameId,
        journeyLocation.challengeNameId,
        journeyLocation.opportunityNameId
      )}${canvasUrl}`;
    } else {
      return `${buildChallengeUrl(journeyLocation.hubNameId, journeyLocation.challengeNameId)}${canvasUrl}`;
    }
  } else {
    return `${buildHubUrl(journeyLocation.hubNameId)}${canvasUrl}`;
  }
};
