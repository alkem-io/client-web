import type { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { SpaceAboutMinimalUrlModel } from '@/domain/space/about/model/spaceAboutMinimal.model';

// `UserPendingMemberships` selects the AVATAR and CARD visuals on top of the
// `SpaceAboutMinimalUrl` fragment, which carries neither. Both are needed: per
// the canonical visual-fields rule an L0 space has no avatar (cardBanner only),
// while L1/L2 subspaces have both.
type SpaceAboutWithVisualsModel = Omit<SpaceAboutMinimalUrlModel, 'profile'> & {
  profile: SpaceAboutMinimalUrlModel['profile'] & {
    avatar?: {
      uri: string;
      alternativeText?: string;
    };
    cardBanner?: {
      uri: string;
      alternativeText?: string;
    };
  };
};

export interface PendingApplicationItem extends Identifiable {
  spacePendingMembershipInfo: Identifiable & {
    level: SpaceLevel;
    about: SpaceAboutWithVisualsModel;
  };
  application: {
    createdDate: Date | string;
    state?: string;
  };
}
