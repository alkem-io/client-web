import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';

export enum CalloutGroupNameValuesMap {
  Home_1 = 'HOME_1',
  Home_2 = 'HOME_2',
  Contribute_1 = 'CONTRIBUTE_1',
  Contribute_2 = 'CONTRIBUTE_2',
  Community_1 = 'COMMUNITY_1',
  Community_2 = 'COMMUNITY_2',
  Subspaces_1 = 'SUBSPACES_1',
  Subspaces_2 = 'SUBSPACES_2',
  Knowledge = 'KNOWLEDGE',
}

export const JourneyCalloutGroupNameOptions: Record<JourneyTypeName, CalloutGroupName[]> = {
  space: [
    CalloutGroupName.Home_1,
    CalloutGroupName.Home_2,
    CalloutGroupName.Community_1,
    CalloutGroupName.Community_2,
    CalloutGroupName.Subspaces_1,
    CalloutGroupName.Subspaces_2,
    CalloutGroupName.Knowledge,
  ],
  subspace: [
    CalloutGroupName.Home_1,
    CalloutGroupName.Home_2,
    CalloutGroupName.Contribute_1,
    CalloutGroupName.Contribute_2,
    CalloutGroupName.Subspaces_1,
    CalloutGroupName.Subspaces_2,
  ],
  subsubspace: [
    CalloutGroupName.Home_1,
    CalloutGroupName.Home_2,
    CalloutGroupName.Contribute_1,
    CalloutGroupName.Contribute_2,
  ],
};
