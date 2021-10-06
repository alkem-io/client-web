import { ApplicationResultEntry } from '../../models/graphql-schema';
import { ApplicationTypeEnum } from '../../models/enums/application-type';

type WithType = { type: ApplicationTypeEnum };
export type ApplicationWithType = ApplicationResultEntry & WithType;

const getApplicationWithType = (application: ApplicationResultEntry): ApplicationWithType | never => ({
  ...application,
  type: getType(application),
});
export default getApplicationWithType;

const getType = ({ ecoverseID, challengeID, opportunityID }: ApplicationResultEntry): ApplicationTypeEnum | never => {
  if (ecoverseID && challengeID && opportunityID) {
    return ApplicationTypeEnum.opportunity;
  }

  if (ecoverseID && opportunityID && !challengeID) {
    throw new TypeError("'challengeID' parameter expected when 'ecoverseID' and 'opportunityID' are provided");
  }

  if (ecoverseID && challengeID) {
    return ApplicationTypeEnum.challenge;
  }

  if (ecoverseID) {
    return ApplicationTypeEnum.ecoverse;
  }

  throw new TypeError("'ecoverseID' parameter expected");
};
