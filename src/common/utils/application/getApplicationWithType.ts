import { ApplicationForRoleResult } from '../../../core/apollo/generated/graphql-schema';
import { ApplicationTypeEnum } from '../../../domain/community/application/constants/ApplicationType';

type WithType = { type: ApplicationTypeEnum };
export type ApplicationWithType = ApplicationForRoleResult & WithType;

const getApplicationWithType = (application: ApplicationForRoleResult): ApplicationWithType | never => ({
  ...application,
  type: getType(application),
});
export default getApplicationWithType;

const getType = ({ hubID, challengeID, opportunityID }: ApplicationForRoleResult): ApplicationTypeEnum | never => {
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
