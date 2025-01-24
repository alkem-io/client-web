import { CalloutGroupName } from '@/core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '@/domain/journey/JourneyTypeName';

export enum CalloutGroupNameValuesMap {
  Home = 'HOME',
  Contribute = 'CONTRIBUTE',
  Community = 'COMMUNITY',
  Subspaces = 'SUBSPACES',
  Knowledge = 'KNOWLEDGE',
}

export const JourneyCalloutGroupNameOptions: Record<JourneyTypeName | 'knowledge-base', CalloutGroupName[]> = {
  space: [CalloutGroupName.Home, CalloutGroupName.Community, CalloutGroupName.Subspaces, CalloutGroupName.Knowledge],
  subspace: [CalloutGroupName.Home],
  subsubspace: [CalloutGroupName.Home],
  'knowledge-base': [CalloutGroupName.Home],
};
