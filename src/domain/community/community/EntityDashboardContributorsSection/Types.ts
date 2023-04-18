import { WithId } from '../../../../types/WithId';
import { ContributorCardProps } from '../../contributor/ContributorCardSquare/ContributorCardSquare';
import {
  AssociatedOrganizationDetailsFragment,
  DashboardLeadUserFragment,
} from '../../../../core/apollo/generated/graphql-schema';

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
