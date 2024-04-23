import { ApplicationForRoleResult } from '../../../../core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';

type WithType = { type: JourneyTypeName };
export type ApplicationWithType = ApplicationForRoleResult & WithType;

const getApplicationWithType = (application: ApplicationForRoleResult): ApplicationWithType | never => ({
  ...application,
  type: getType(application),
});
export default getApplicationWithType;

const getType = ({ spaceID, challengeID, opportunityID }: ApplicationForRoleResult): JourneyTypeName => {
  if (spaceID && challengeID && opportunityID) {
    return 'opportunity';
  }

  if (spaceID && opportunityID && !challengeID) {
    throw new TypeError("'challengeID' parameter expected when 'spaceID' and 'opportunityID' are provided");
  }

  if (spaceID && challengeID) {
    return 'challenge';
  }

  if (spaceID) {
    return 'space';
  }

  throw new TypeError("'spaceID' parameter expected");
};
