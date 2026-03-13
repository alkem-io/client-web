import type { ActorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import type { Identifiable } from '@/core/utils/Identifiable';

export interface SpaceHostedItem extends Identifiable {
  spaceID: string;
  spaceLevel: SpaceLevel;
  contributorId: string;
  contributorType: ActorType;
  roles?: string[];
  parentSpaceId?: string; // For subspaces, ID of the parent space
}
