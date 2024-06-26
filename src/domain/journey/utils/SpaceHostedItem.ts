import { CommunityContributorType } from '../../../core/apollo/generated/graphql-schema';
import { Identifiable } from '../../../core/utils/Identifiable';
import { JourneyLevel } from '../../../main/routing/resolvers/RouteResolver';

export interface SpaceHostedItem extends Identifiable {
  spaceID: string;
  spaceLevel: JourneyLevel;
  contributorId: string;
  contributorType: CommunityContributorType;
}
