import { COMMUNITY_ROUTE } from '../models/constants';

export const buildEcoverseUrl = (ecoverseNameId: string) => `/${ecoverseNameId}`;

export const buildChallengeUrl = (ecoverseNameId: string, challengeNameId: string) =>
  buildEcoverseUrl(ecoverseNameId).concat(`/challenges/${challengeNameId}`);

export const buildOpportunityUrl = (ecoverseNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildChallengeUrl(ecoverseNameId, challengeNameId).concat(`/opportunities/${opportunityNameId}`);

export const buildOrganisationUrl = (organisationNameId: string) => `/organization/${organisationNameId}`;

export const buildAdminEcoverseUrl = (ecoverseNameId: string) => `/admin/ecoverses/${ecoverseNameId}`;

export const buildAdminChallengeUrl = (ecoverseNameId: string, challengeNameId: string) =>
  buildAdminEcoverseUrl(ecoverseNameId).concat(`/challenges/${challengeNameId}`);

export const buildAdminOpportunityUrl = (ecoverseNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildAdminChallengeUrl(ecoverseNameId, challengeNameId).concat(`/opportunities/${opportunityNameId}`);

export const buildAdminOrganisationUrl = (organisationNameId: string) => `/admin/organizations/${organisationNameId}`;

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
