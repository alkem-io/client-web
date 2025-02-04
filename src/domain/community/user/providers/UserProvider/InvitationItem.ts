import { RoleSetContributorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';

export interface InvitationItem extends Identifiable {
  spacePendingMembershipInfo: Identifiable & {
    level: SpaceLevel;
    profile: {
      url: string;
      displayName: string;
      tagline?: string;
    };
  };
  invitation: {
    id: string;
    createdBy: Identifiable;
    welcomeMessage?: string;
    createdDate: Date | string;
    state?: string;
    contributorType?: RoleSetContributorType;
  };
}
