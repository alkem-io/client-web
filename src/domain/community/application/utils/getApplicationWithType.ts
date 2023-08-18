import { ApplicationForRoleResult } from '../../../../core/apollo/generated/graphql-schema';
import { ApplicationTypeEnum } from '../constants/ApplicationType';

type WithType = { type: ApplicationTypeEnum };
export type ApplicationWithType = ApplicationForRoleResult & WithType;

const getApplicationWithType = (application: ApplicationForRoleResult): ApplicationWithType | never => ({
  ...application,
  type: getType(application),
});
export default getApplicationWithType;

const getType = ({ spaceID, challengeID, opportunityID }: ApplicationForRoleResult): ApplicationTypeEnum | never => {
  if (spaceID && challengeID && opportunityID) {
    return ApplicationTypeEnum.opportunity;
  }

  if (spaceID && opportunityID && !challengeID) {
    throw new TypeError("'challengeID' parameter expected when 'spaceID' and 'opportunityID' are provided");
  }

  if (spaceID && challengeID) {
    return ApplicationTypeEnum.challenge;
  }

  if (spaceID) {
    return ApplicationTypeEnum.space;
  }

  throw new TypeError("'spaceID' parameter expected");
};
