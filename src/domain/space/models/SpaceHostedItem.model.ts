import { ActorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';

export interface SpaceHostedItem extends Identifiable {
  spaceID: string;
  spaceLevel: SpaceLevel;
  contributorId: string;
  contributorType: ActorType;
  roles?: string[];
  parentSpaceId?: string; // For subspaces, ID of the parent space
}
