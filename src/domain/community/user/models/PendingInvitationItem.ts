import type { ActorType, RoleName, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { SpaceAboutMinimalUrlModel } from '@/domain/space/about/model/spaceAboutMinimal.model';

export interface PendingInvitationItem extends Identifiable {
  spacePendingMembershipInfo: Identifiable & {
    level: SpaceLevel;
    about: SpaceAboutMinimalUrlModel;
  };
  invitation: {
    id: string;
    createdBy?: Identifiable;
    welcomeMessage?: string;
    createdDate: Date | string;
    state?: string;
    extraRoles?: RoleName[];
    actor?: {
      id: string;
      type: ActorType;
      profile?: {
        displayName: string;
        url?: string;
      };
    };
    spacesToJoinOnAccept?: { id: string; profile: { displayName: string; url: string } }[];
  };
}
