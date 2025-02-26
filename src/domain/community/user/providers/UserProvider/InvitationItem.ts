import { RoleSetContributorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';
import { SpaceAboutMinimalModel } from '@/domain/space/about/model/spaceAboutMinimal.model';

export interface InvitationItem extends Identifiable {
  spacePendingMembershipInfo: Identifiable & {
    level: SpaceLevel;
    about: SpaceAboutMinimalModel;
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
