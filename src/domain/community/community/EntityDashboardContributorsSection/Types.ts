import { WithId } from '@/core/utils/WithId';
import { ContributorCardSquareProps } from '@/domain/community/contributor/ContributorCardSquare/ContributorCardSquare';
import { Identifiable } from '@/core/utils/Identifiable';

export interface EntityDashboardContributors {
  memberUsers: WithId<ContributorCardSquareProps>[] | undefined;
  memberUsersCount: number | undefined;
  memberOrganizations: WithId<ContributorCardSquareProps>[] | undefined;
  memberOrganizationsCount: number | undefined;
}

// TODO clean up fetched data
export interface ContributorViewProps extends Identifiable {
  profile: {
    displayName: string;
    avatar?: {
      uri: string;
    };
    location?: {
      city?: string;
      country?: string;
    };
    tagline?: string;
    tagsets?: {
      tags: string[];
    }[];
    url: string;
  };
  isContactable?: boolean;
}
