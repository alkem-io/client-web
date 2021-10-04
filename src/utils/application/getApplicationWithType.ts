import { ApplicationResultEntry } from '../../models/graphql-schema';
import ApplicationTypeEnum from '../../models/application-type';

type WithType = { type: ApplicationTypeEnum };
export type ApplicationWithType = ApplicationResultEntry & WithType;

const getApplicationWithType = (application: ApplicationResultEntry): ApplicationWithType | never => ({
  ...application,
  type: getType(application),
});
export default getApplicationWithType;

const getType = ({ ecoverseID, challengeID, opportunityID }: ApplicationResultEntry): ApplicationTypeEnum | never => {
  if (ecoverseID && challengeID && opportunityID) {
    return ApplicationTypeEnum.OPPORTUNITY;
  }

  if (ecoverseID && opportunityID && !challengeID) {
    throw new TypeError("'challengeID' parameter expected when 'ecoverseID' and 'opportunityID' are provided");
  }

  if (ecoverseID && challengeID) {
    return ApplicationTypeEnum.CHALLENGE;
  }

  if (ecoverseID) {
    return ApplicationTypeEnum.HUB;
  }

  throw new TypeError("'ecoverseID' parameter expected");
};
