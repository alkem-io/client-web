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

export const buildUserProfileUrl = (userNameId: string) => `/user/${userNameId}`;
