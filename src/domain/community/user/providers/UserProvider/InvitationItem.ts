import { CommunityContributorType } from '../../../../../core/apollo/generated/graphql-schema';
import { Identifiable } from '../../../../../core/utils/Identifiable';
import { JourneyLevel } from '../../../../../main/routing/resolvers/RouteResolver';

export interface InvitationItem extends Identifiable {
  space: Identifiable & {
    level: JourneyLevel | number;
    profile: {
      url: string;
      displayName: string;
      tagline: string;
    };
  };
  invitation: {
    id: string;
    createdBy: Identifiable;
    welcomeMessage?: string;
    createdDate: Date | string;
    lifecycle: { state?: string };
    contributorType?: CommunityContributorType.Virtual;
  };
}
