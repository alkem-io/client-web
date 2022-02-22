import { ApplicationResultEntry } from '../../models/graphql-schema';
import { ApplicationTypeEnum } from '../../models/enums/application-type';

type WithType = { type: ApplicationTypeEnum };
export type ApplicationWithType = ApplicationResultEntry & WithType;

const getApplicationWithType = (application: ApplicationResultEntry): ApplicationWithType | never => ({
  ...application,
  type: getType(application),
});
export default getApplicationWithType;

const getType = ({ hubID, challengeID, opportunityID }: ApplicationResultEntry): ApplicationTypeEnum | never => {
  if (hubID && challengeID && opportunityID) {
    return ApplicationTypeEnum.opportunity;
  }

  if (hubID && opportunityID && !challengeID) {
    throw new TypeError("'challengeID' parameter expected when 'hubID' and 'opportunityID' are provided");
  }

  if (hubID && challengeID) {
    return ApplicationTypeEnum.challenge;
  }

  if (hubID) {
    return ApplicationTypeEnum.hub;
  }

  throw new TypeError("'hubID' parameter expected");
};
