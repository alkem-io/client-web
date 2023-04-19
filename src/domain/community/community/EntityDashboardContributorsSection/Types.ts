import { WithId } from '../../../../types/WithId';
import { ContributorCardSquareProps } from '../../contributor/ContributorCardSquare/ContributorCardSquare';
import {
  AssociatedOrganizationDetailsFragment,
  DashboardLeadUserFragment,
} from '../../../../core/apollo/generated/graphql-schema';

export interface EntityDashboardContributors {
  memberUsers: WithId<ContributorCardSquareProps>[] | undefined;
  memberUsersCount: number | undefined;
  memberOrganizations: WithId<ContributorCardSquareProps>[] | undefined;
  memberOrganizationsCount: number | undefined;
}

export interface EntityDashboardLeads {
  leadUsers: DashboardLeadUserFragment[] | undefined;
  leadOrganizations: AssociatedOrganizationDetailsFragment[] | undefined;
}
