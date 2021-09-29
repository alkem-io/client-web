import { ApplicationResultEntry } from '../../models/graphql-schema';

export enum ApplicationType {
  HUB = 'Hub',
  CHALLENGE = 'Challenge',
  OPPORTUNITY = 'Opportunity',
}
type WithType = { type: ApplicationType };
export type ApplicationWithType = ApplicationResultEntry & WithType;

const getApplicationWithType = (application: ApplicationResultEntry): ApplicationWithType | never => ({
  ...application,
  type: getType(application),
});
export default getApplicationWithType;

const getType = ({ ecoverseID, challengeID, opportunityID }: ApplicationResultEntry): ApplicationType | never => {
  if (ecoverseID && challengeID && opportunityID) {
    return ApplicationType.OPPORTUNITY;
  }

  if (ecoverseID && opportunityID && !challengeID) {
    throw new TypeError("'challengeID' parameter expected when 'ecoverseID' and 'opportunityID' are provided");
  }

  if (ecoverseID && challengeID) {
    return ApplicationType.CHALLENGE;
  }

  if (ecoverseID) {
    return ApplicationType.HUB;
  }

  throw new TypeError("'ecoverseID' parameter expected");
};
