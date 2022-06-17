import { WithId } from '../../../types/WithId';
import { ContributorCardProps } from '../../../components/composite/common/cards/ContributorCard/ContributorCard';
import { AssociatedOrganizationDetailsFragment, DashboardLeadUserFragment } from '../../../models/graphql-schema';

export interface EntityDashboardContributors {
  memberUsers: WithId<ContributorCardProps>[] | undefined;
  memberUsersCount: number | undefined;
  memberOrganizations: WithId<ContributorCardProps>[] | undefined;
  memberOrganizationsCount: number | undefined;
}

export interface EntityDashboardLeads {
  leadUsers: DashboardLeadUserFragment[] | undefined;
  leadOrganizations: AssociatedOrganizationDetailsFragment[] | undefined;
}
