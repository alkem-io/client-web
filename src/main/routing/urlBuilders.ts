import { _AUTH_LOGIN_PATH } from '../../core/auth/authentication/constants/authentication.constants';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';
import {
  CoreEntityIdTypes,
  isChallengeId,
  isChallengeOpportunityIds,
  isSpaceId,
} from '../../domain/shared/types/CoreEntityIds';
import { JourneyTypeName } from '../../domain/journey/JourneyTypeName';
import { ROUTE_HOME } from '../../domain/platform/routes/constants';

export const buildSpaceUrl = (spaceNameId: string) => `/${spaceNameId}`;

export const buildChallengeUrl = (spaceNameId: string, challengeNameId: string) =>
  buildSpaceUrl(spaceNameId).concat(`/challenges/${challengeNameId}`);

export const buildOpportunityUrl = (spaceNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildChallengeUrl(spaceNameId, challengeNameId).concat(`/opportunities/${opportunityNameId}`);

export const buildOrganizationUrl = (organizationNameId: string) => `/organization/${organizationNameId}`;

export const buildAdminSpaceUrl = (spaceNameId: string) => `/admin/spaces/${spaceNameId}`;

export const buildAdminChallengeUrl = (spaceNameId: string, challengeNameId: string) =>
  buildAdminSpaceUrl(spaceNameId).concat(`/challenges/${challengeNameId}`);

export const buildAdminNewChallengeUrl = (spaceNameId: string) =>
  buildAdminSpaceUrl(spaceNameId).concat('/challenges/new');

export const buildAdminOpportunityUrl = (spaceNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildAdminChallengeUrl(spaceNameId, challengeNameId).concat(`/opportunities/${opportunityNameId}`);

export const buildAdminNewOpportunityUrl = (spaceNameId: string, challengeNameId: string) =>
  buildAdminChallengeUrl(spaceNameId, challengeNameId).concat('/opportunities/new');

export const buildAdminOrganizationUrl = (organizationNameId: string) => `/admin/organizations/${organizationNameId}`;

export const buildUserProfileUrl = (userNameId: string) => `/user/${userNameId}`;
export const buildUserProfileSettingsUrl = (userNameId: string) =>
  `${buildUserProfileUrl(userNameId)}/settings/profile`;

export const buildReturnUrlParam = (returnUrl = ROUTE_HOME, origin = window.location.origin) => {
  const fullReturnUrl = `${origin}${returnUrl}`;
  return `?returnUrl=${encodeURI(fullReturnUrl)}`;
};

export const buildLoginUrl = (returnUrl?: string) => {
  return `${_AUTH_LOGIN_PATH}${buildReturnUrlParam(returnUrl)}`;
};

export const buildSpaceApplyUrl = (spaceNameId: string) => `${buildSpaceUrl(spaceNameId)}/apply`;

export const buildChallengeApplyUrl = (spaceNameId: string, challengeNameId: string) =>
  `${buildChallengeUrl(spaceNameId, challengeNameId)}/apply`;

export const buildProjectUrl = (
  spaceNameId: string,
  challengeNameId: string,
  opportunityNameId: string,
  projectNameId: string
) => `${buildOpportunityUrl(spaceNameId, challengeNameId, opportunityNameId)}/projects/${projectNameId}`;

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
    case 'space':
      return 'spaceNameId';
    case 'challenge':
      return 'challengeNameId';
    case 'opportunity':
      return 'opportunityNameId';
  }
};

export const buildJourneyUrl = (journeyLocation: JourneyLocation) => {
  if (isSpaceId(journeyLocation)) {
    return buildSpaceUrl(journeyLocation.spaceNameId);
  }
  if (isChallengeId(journeyLocation)) {
    return buildChallengeUrl(journeyLocation.spaceNameId, journeyLocation.challengeNameId);
  }
  if (isChallengeOpportunityIds(journeyLocation)) {
    return buildOpportunityUrl(
      journeyLocation.spaceNameId,
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

export const buildAboutUrl = (journeyLocation: JourneyLocation) => {
  return `${buildJourneyUrl(journeyLocation)}/about`;
};

export const buildPostUrl = (calloutNameId: string, postNameId: string, journeyLocation: JourneyLocation) => {
  const postUrl = `/${EntityPageSection.Collaboration}/${calloutNameId}/posts/${postNameId}`;
  return `${buildJourneyUrl(journeyLocation)}${postUrl}`;
};

export const buildWhiteboardUrl = (
  calloutNameId: string,
  whiteboardNameId: string,
  journeyLocation: JourneyLocation
) => {
  const whiteboardUrl = `/${EntityPageSection.Collaboration}/${calloutNameId}/whiteboards/${whiteboardNameId}`;
  return `${buildJourneyUrl(journeyLocation)}${whiteboardUrl}`;
};

export const buildEventUrl = (eventNameId: string, journeyLocation: JourneyLocation) => {
  const eventUrl = `/${EntityPageSection.Dashboard}/calendar/${eventNameId}`;
  return `${buildJourneyUrl(journeyLocation)}${eventUrl}`;
};

export const buildDocumentUrl = (platformDomain: string, documentId: string) =>
  `//${platformDomain}/api/private/rest/storage/document/${documentId}`;
