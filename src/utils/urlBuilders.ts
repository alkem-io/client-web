const buildEcoverseUrl = (ecoverseNameId: string) => `/${ecoverseNameId}`;

const buildChallengeUrl = (ecoverseNameId: string, challengeNameId: string) =>
  buildEcoverseUrl(ecoverseNameId).concat(`/challenges/${challengeNameId}`);

const buildOpportunityUrl = (ecoverseNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildChallengeUrl(ecoverseNameId, challengeNameId).concat(`/opportunities/${opportunityNameId}`);

const buildOrganisationUrl = (organisationNameId: string) => `/organisation/${organisationNameId}`;

const buildAdminEcoverseUrl = (ecoverseNameId: string) => `/admin/ecoverses/${ecoverseNameId}`;

const buildAdminChallengeUrl = (ecoverseNameId: string, challengeNameId: string) =>
  buildAdminEcoverseUrl(ecoverseNameId).concat(`/challenges/${challengeNameId}`);

const buildAdminOpportunityUrl = (ecoverseNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildAdminChallengeUrl(ecoverseNameId, challengeNameId).concat(`/opportunities/${opportunityNameId}`);

const buildAdminOrganisationUrl = (organisationNameId: string) => `/admin/organizations/${organisationNameId}`;

export {
  buildEcoverseUrl,
  buildChallengeUrl,
  buildOpportunityUrl,
  buildAdminEcoverseUrl,
  buildAdminChallengeUrl,
  buildAdminOpportunityUrl,
  buildOrganisationUrl,
  buildAdminOrganisationUrl,
};
