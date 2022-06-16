import { WithId } from '../../../types/WithId';
import { ContributorCardProps } from '../../../components/composite/common/cards/ContributorCard/ContributorCard';

export interface EntityDashboardContributors {
  leadUsers: WithId<ContributorCardProps>[] | undefined;
  leadUsersCount: number | undefined;
  memberUsers: WithId<ContributorCardProps>[] | undefined;
  memberUsersCount: number | undefined;
  memberOrganizations: WithId<ContributorCardProps>[] | undefined;
  memberOrganizationsCount: number | undefined;
  // skipped for Hub
  leadOrganizations?: WithId<ContributorCardProps>[] | undefined;
  leadOrganizationsCount?: number | undefined;
}
