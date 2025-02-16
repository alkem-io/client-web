import { PropsWithChildren, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import {
  AuthorizationPrivilege,
  MetricsItemFragment,
  RoleName,
  RoleSetContributorType,
  SearchVisibility,
  SpaceAboutDetailsFragment,
} from '@/core/apollo/generated/graphql-schema';
import { ContributorCardSquareProps } from '@/domain/community/contributor/ContributorCardSquare/ContributorCardSquare';
import { WithId } from '@/core/utils/WithId';
import useCommunityMembersAsCardProps from '@/domain/community/community/utils/useCommunityMembersAsCardProps';
import { ContainerChildProps } from '@/core/container/container';
import { useAboutPageMembersQuery, useAboutPageNonMembersQuery } from '@/core/apollo/generated/apollo-hooks';
import getMetricCount from '@/domain/platform/metrics/utils/getMetricCount';
import { MetricType } from '@/domain/platform/metrics/MetricType';
import { InnovationFlowDetails } from '@/domain/collaboration/InnovationFlow/InnovationFlow';
import { ContributorViewProps } from '@/domain/community/community/EntityDashboardContributorsSection/Types';
import { VirtualContributorProps } from '@/domain/community/community/VirtualContributorsBlock/VirtualContributorsDialog';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';

interface AboutPagePermissions {
  canReadCommunity: boolean;
}

export interface AboutPageContainerEntities {
  about: SpaceAboutDetailsFragment;
  innovationFlow: InnovationFlowDetails | undefined;
  permissions: AboutPagePermissions;
  metrics: MetricsItemFragment[] | undefined;
  memberUsers: WithId<ContributorCardSquareProps>[] | undefined;
  memberUsersCount: number | undefined;
  memberOrganizations: WithId<ContributorCardSquareProps>[] | undefined;
  memberOrganizationsCount: number | undefined;
  leadUsers: ContributorViewProps[] | undefined;
  leadOrganizations: ContributorViewProps[] | undefined;
  provider: ContributorViewProps | undefined;
  virtualContributors?: VirtualContributorProps[];
  hasReadPrivilege?: boolean;
  hasInvitePrivilege?: boolean;
}

export interface AboutPageContainerActions {}

export interface AboutPageContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface AboutPageContainerProps
  extends ContainerChildProps<AboutPageContainerEntities, AboutPageContainerActions, AboutPageContainerState> {
  journeyId: string | undefined;
}

const AboutPageContainer = ({ journeyId, children }: PropsWithChildren<AboutPageContainerProps>) => {
  const {
    data: nonMembersData,
    loading: nonMembersDataLoading,
    error: nonMembersDataError,
  } = useAboutPageNonMembersQuery({
    variables: {
      spaceId: journeyId!,
    },
    skip: !journeyId,
  });

  const nonMemberSpace = nonMembersData?.lookup.space;
  const nonMemberSpaceAbout = nonMemberSpace?.about;
  const nonMemberSpaceAboutProfile = nonMemberSpaceAbout?.profile;
  const nonMemberCommunity = nonMembersData?.lookup.space?.community;

  const canReadCommunity =
    nonMemberCommunity?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read) ?? false;

  const {
    data: membersData,
    loading: membersDataLoading,
    error: membersDataError,
  } = useAboutPageMembersQuery({
    variables: {
      spaceId: journeyId!,
    },
    skip: nonMembersDataLoading || !journeyId || !canReadCommunity,
  });

  const {
    usersByRole,
    organizationsByRole,
    virtualContributors,
    myPrivileges: communityPrivileges,
  } = useRoleSetManager({
    roleSetId: membersData?.lookup.space?.community.roleSet.id,
    relevantRoles: [RoleName.Member, RoleName.Lead],
    contributorTypes: [
      RoleSetContributorType.User,
      RoleSetContributorType.Organization,
      RoleSetContributorType.Virtual,
    ],
    fetchContributors: true,
    skip: !canReadCommunity,
  });
  const publicVirtualContributors = virtualContributors.filter(vc => vc.searchVisibility === SearchVisibility.Public);

  const hasReadPrivilege = membersData?.lookup.space?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.Read
  );

  const hasInvitePrivilege =
    communityPrivileges?.includes(AuthorizationPrivilege.RolesetEntryRoleInvite) ||
    communityPrivileges?.includes(AuthorizationPrivilege.CommunityAssignVcFromAccount) ||
    false;

  // TODO looks like space is missing
  const collaboration = nonMembersData?.lookup.space?.collaboration;

  const provider = nonMembersData?.lookup.space?.provider;

  const leadUsers = usersByRole[RoleName.Lead];
  const leadOrganizations = organizationsByRole[RoleName.Lead];

  const metrics = nonMemberSpace?.metrics;

  const memberUsers = usersByRole[RoleName.Member];
  const memberOrganizations = organizationsByRole[RoleName.Member];
  const membersCount = getMetricCount(metrics, MetricType.Member);
  const memberUsersCount = membersCount - (memberOrganizations?.length ?? 0); // Todo: may not be safe, better to simply report out metrics on member users + member orgs
  const contributors = useCommunityMembersAsCardProps(
    {
      memberUsers,
      memberOrganizations,
    },
    { memberUsersCount }
  );

  const permissions: AboutPagePermissions = {
    canReadCommunity,
  };

  const loading = nonMembersDataLoading ?? membersDataLoading ?? false;
  const error = nonMembersDataError ?? membersDataError;

  const about: SpaceAboutDetailsFragment = useMemo(() => {
    return {
      id: nonMemberSpaceAbout?.id ?? '',
      profile: {
        id: nonMemberSpaceAboutProfile?.id ?? '',
        displayName: nonMemberSpaceAboutProfile?.displayName ?? '',
        description: nonMemberSpaceAboutProfile?.description,
        tagset: nonMemberSpaceAboutProfile?.tagset,
        tagline: nonMemberSpaceAboutProfile?.tagline ?? '',
        url: nonMemberSpaceAboutProfile?.url ?? '',
        visuals: nonMemberSpaceAboutProfile?.visuals ?? [],
      },
    };
  }, [nonMemberSpaceAboutProfile]);

  return (
    <>
      {children(
        {
          about,
          innovationFlow: collaboration?.innovationFlow,
          permissions,
          metrics,
          leadUsers,
          leadOrganizations,
          provider,
          virtualContributors: publicVirtualContributors,
          hasReadPrivilege,
          hasInvitePrivilege,
          ...contributors,
        },
        { loading, error },
        {}
      )}
    </>
  );
};

export default AboutPageContainer;
