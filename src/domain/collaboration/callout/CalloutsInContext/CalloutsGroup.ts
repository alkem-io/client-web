import { CalloutGroupName } from '@/core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';

export enum CalloutGroupNameValuesMap {
  Home = 'HOME',
  Contribute = 'CONTRIBUTE',
  Community = 'COMMUNITY',
  Subspaces = 'SUBSPACES',
  Knowledge = 'KNOWLEDGE',
}

export const JourneyCalloutGroupNameOptions: Record<JourneyTypeName, CalloutGroupName[]> = {
  space: [CalloutGroupName.Home, CalloutGroupName.Community, CalloutGroupName.Subspaces, CalloutGroupName.Knowledge],
  subspace: [CalloutGroupName.Home],
  subsubspace: [CalloutGroupName.Home],
};
