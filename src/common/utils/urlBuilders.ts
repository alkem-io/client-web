import { AUTH_LOGIN_PATH, AUTH_REQUIRED_PATH } from '../../core/auth/authentication/constants/authentication.constants';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';
import {
  CoreEntityIdTypes,
  isChallengeId,
  isChallengeOpportunityIds,
  isHubId,
} from '../../domain/shared/types/CoreEntityIds';

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

export type JourneyLocation = CoreEntityIdTypes;

export const buildJourneyUrl = (journeyLocation: JourneyLocation) => {
  if (isHubId(journeyLocation)) {
    return buildHubUrl(journeyLocation.hubNameId);
  }
  if (isChallengeId(journeyLocation)) {
    return buildChallengeUrl(journeyLocation.hubNameId, journeyLocation.challengeNameId);
  }
  if (isChallengeOpportunityIds(journeyLocation)) {
    return buildOpportunityUrl(
      journeyLocation.hubNameId,
      journeyLocation.challengeNameId,
      journeyLocation.opportunityNameId
    );
  }
};

export const buildCalloutUrl = (calloutNameId: string, journeyLocation: JourneyLocation) => {
  const calloutUrl = `/${EntityPageSection.Contribute}/callouts/${calloutNameId}`;
  return `${buildJourneyUrl(journeyLocation)}${calloutUrl}`;
};

export const buildUpdatesUrl = (journeyLocation: JourneyLocation) => {
  const updatesPath = `/${EntityPageSection.Dashboard}/updates`;
  return `${buildJourneyUrl(journeyLocation)}${updatesPath}`;
};

export const buildAspectUrl = (calloutNameId: string, aspectNameId: string, journeyLocation: JourneyLocation) => {
  const aspectUrl = `/${EntityPageSection.Contribute}/callouts/${calloutNameId}/aspects/${aspectNameId}`;
  return `${buildJourneyUrl(journeyLocation)}${aspectUrl}`;
};

export const buildCanvasUrl = (calloutNameId: string, canvasNameId: string, journeyLocation: JourneyLocation) => {
  const canvasUrl = `/${EntityPageSection.Contribute}/callouts/${calloutNameId}/canvases/${canvasNameId}`;
  return `${buildJourneyUrl(journeyLocation)}${canvasUrl}`;
};
