import { WithId } from '../../../../core/utils/WithId';
import { ContributorCardSquareProps } from '../../contributor/ContributorCardSquare/ContributorCardSquare';
import { DashboardLeadUserFragment } from '../../../../core/apollo/generated/graphql-schema';
import { Identifiable } from '../../../../core/utils/Identifiable';

export interface EntityDashboardContributors {
  memberUsers: WithId<ContributorCardSquareProps>[] | undefined;
  memberUsersCount: number | undefined;
  memberOrganizations: WithId<ContributorCardSquareProps>[] | undefined;
  memberOrganizationsCount: number | undefined;
}

// TODO remove nameID
// TODO clean up fetched data
export interface ContributorViewProps extends Identifiable {
  nameID: string;
  profile: {
    displayName: string;
    avatar?: {
      uri: string;
    };
    location?: {
      country: string;
      city: string;
    };
    tagline?: string;
    tagsets?: {
      tags: string[];
    }[];
    url: string;
  };
}

export interface EntityDashboardLeads {
  leadUsers: DashboardLeadUserFragment[] | undefined;
  leadOrganizations: ContributorViewProps[] | undefined;
  leadVirtualContributors: ContributorViewProps[] | undefined;
  host?: ContributorViewProps;
}
