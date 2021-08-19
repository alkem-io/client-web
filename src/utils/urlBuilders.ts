const buildEcoverseUrl = (ecoverseNameId: string) => `/${ecoverseNameId}`;

const buildChallengeUrl = (ecoverseNameId: string, challengeNameId: string) =>
  buildEcoverseUrl(ecoverseNameId).concat(`/challenges/${challengeNameId}`);

const buildOpportunityUrl = (ecoverseNameId: string, challengeNameId: string, opportunityNameId: string) =>
  buildChallengeUrl(ecoverseNameId, challengeNameId).concat(`/opportunities/${opportunityNameId}`);

export { buildEcoverseUrl, buildChallengeUrl, buildOpportunityUrl };
