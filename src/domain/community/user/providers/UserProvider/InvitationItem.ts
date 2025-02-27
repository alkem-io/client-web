import { RoleSetContributorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';
import { SpaceAboutMinimalUrlModel } from '@/domain/space/about/model/spaceAboutMinimal.model';

export interface InvitationItem extends Identifiable {
  spacePendingMembershipInfo: Identifiable & {
    level: SpaceLevel;
    about: SpaceAboutMinimalUrlModel;
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
