import { _AUTH_LOGIN_PATH } from '../../core/auth/authentication/constants/authentication.constants';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';
import {
  CoreEntityIdTypes,
  isChallengeId,
  isChallengeOpportunityIds,
  isHubId,
} from '../../domain/shared/types/CoreEntityIds';
import { JourneyTypeName } from '../../domain/challenge/JourneyTypeName';
import { ROUTE_HOME } from '../../domain/platform/routes/constants';

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

export const buildReturnUrlParam = (returnUrl = ROUTE_HOME) => {
  const fullReturnUrl = `${window.location.origin}${returnUrl}`;
  return `?returnUrl=${encodeURI(fullReturnUrl)}`;
};

export const buildLoginUrl = (returnUrl?: string) => {
  return `${_AUTH_LOGIN_PATH}${buildReturnUrlParam(returnUrl)}`;
};

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
  const stripUrl = url.replaceAll(/\/discussion|\/new/g, '');
  return `${stripUrl}/discussion/${id}`;
};

export const buildDiscussionsUrl = (url: string) => {
  const stripUrl = url.replace(/\/discussion\/.*/g, '');
  return `${stripUrl}/discussion/`;
};

export const buildNewDiscussionUrl = (url: string) => {
  const stripUrl = url.replace('/discussion', '');
  return `${stripUrl}/discussion/new`;
};

export const buildNewOrganizationUrl = () => {
  return '/admin/organizations/new';
};

export type JourneyLocation = CoreEntityIdTypes;

export const getJourneyLocationKey = (journeyTypeName: JourneyTypeName): keyof JourneyLocation => {
  switch (journeyTypeName) {
    case 'hub':
      return 'hubNameId';
    case 'challenge':
      return 'challengeNameId';
    case 'opportunity':
      return 'opportunityNameId';
  }
};

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
  const calloutUrl = `/${EntityPageSection.Collaboration}/${calloutNameId}`;
  return `${buildJourneyUrl(journeyLocation)}${calloutUrl}`;
};

export const buildUpdatesUrl = (journeyLocation: JourneyLocation) => {
  const updatesPath = `/${EntityPageSection.Dashboard}/updates`;
  return `${buildJourneyUrl(journeyLocation)}${updatesPath}`;
};

export const buildAspectUrl = (calloutNameId: string, aspectNameId: string, journeyLocation: JourneyLocation) => {
  const aspectUrl = `/${EntityPageSection.Collaboration}/${calloutNameId}/aspects/${aspectNameId}`;
  return `${buildJourneyUrl(journeyLocation)}${aspectUrl}`;
};

export const buildCanvasUrl = (calloutNameId: string, canvasNameId: string, journeyLocation: JourneyLocation) => {
  const canvasUrl = `/${EntityPageSection.Collaboration}/${calloutNameId}/canvases/${canvasNameId}`;
  return `${buildJourneyUrl(journeyLocation)}${canvasUrl}`;
};
