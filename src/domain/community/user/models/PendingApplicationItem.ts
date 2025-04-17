import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';
import { SpaceAboutMinimalUrlModel } from '@/domain/space/about/model/spaceAboutMinimal.model';

export interface PendingApplicationItem extends Identifiable {
  spacePendingMembershipInfo: Identifiable & {
    level: SpaceLevel;
    about: SpaceAboutMinimalUrlModel;
  };
  application: {
    createdDate: Date | string;
    state?: string;
  };
}
