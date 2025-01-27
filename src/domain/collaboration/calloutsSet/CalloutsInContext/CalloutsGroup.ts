import { CalloutGroupName } from '@/core/apollo/generated/graphql-schema';
import { CalloutsSetParentType, KnowledgeBaseCalloutsSetType } from '@/domain/journey/JourneyTypeName';

export enum CalloutGroupNameValuesMap {
  Home = 'HOME',
  Contribute = 'CONTRIBUTE',
  Community = 'COMMUNITY',
  Subspaces = 'SUBSPACES',
  Knowledge = 'KNOWLEDGE',
}

export const JourneyCalloutGroupNameOptions: Record<CalloutsSetParentType, CalloutGroupName[]> = {
  space: [CalloutGroupName.Home, CalloutGroupName.Community, CalloutGroupName.Subspaces, CalloutGroupName.Knowledge],
  subspace: [CalloutGroupName.Home],
  subsubspace: [CalloutGroupName.Home],
  [KnowledgeBaseCalloutsSetType]: [CalloutGroupName.Home],
};
