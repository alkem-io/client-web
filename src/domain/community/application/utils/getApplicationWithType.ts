import { ApplicationForRoleResult } from '../../../../core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';

type WithType = { type: JourneyTypeName };
export type ApplicationWithType = ApplicationForRoleResult & WithType;

const getApplicationWithType = (application: ApplicationForRoleResult): ApplicationWithType | never => ({
  ...application,
  type: getType(application),
});
export default getApplicationWithType;

const getType = ({ spaceID, subspaceID, subsubspaceID }: ApplicationForRoleResult): JourneyTypeName => {
  if (spaceID && subspaceID && subsubspaceID) {
    return 'subsubspace';
  }

  if (spaceID && subsubspaceID && !subspaceID) {
    throw new TypeError("'subspaceID' parameter expected when 'spaceID' and 'subsubspaceID' are provided");
  }

  if (spaceID && subspaceID) {
    return 'subspace';
  }

  if (spaceID) {
    return 'space';
  }

  throw new TypeError("'spaceID' parameter expected");
};
