import { RoleSetContributorType, SpaceAboutLightUrlFragment, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';

export interface InvitationItem extends Identifiable {
  spacePendingMembershipInfo: Identifiable & {
    level: SpaceLevel;
    about: SpaceAboutLightUrlFragment;
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
