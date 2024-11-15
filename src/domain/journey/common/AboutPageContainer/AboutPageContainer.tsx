import React, { FC, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import {
  AuthorizationPrivilege,
  ContextTabFragment,
  MetricsItemFragment,
  Profile,
  ReferenceDetailsFragment,
  SearchVisibility,
  Tagset,
} from '@/core/apollo/generated/graphql-schema';
import { ContributorCardSquareProps } from '../../../community/contributor/ContributorCardSquare/ContributorCardSquare';
import { WithId } from '@/core/utils/WithId';
import useCommunityMembersAsCardProps, {
  RoleSetMembers,
} from '../../../community/community/utils/useCommunityMembersAsCardProps';
import { ContainerChildProps } from '@/core/container/container';
import { useAboutPageMembersQuery, useAboutPageNonMembersQuery } from '@/core/apollo/generated/apollo-hooks';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';
import { InnovationFlowDetails } from '../../../collaboration/InnovationFlow/InnovationFlow';
import { ContributorViewProps } from '../../../community/community/EntityDashboardContributorsSection/Types';
import { VirtualContributorProps } from '../../../community/community/VirtualContributorsBlock/VirtualContributorsDialog';

interface AboutPagePermissions {
  communityReadAccess: boolean;
}

export interface AboutPageContainerEntities {
  context?: ContextTabFragment;
  profile: Omit<Profile, 'storageBucket'>;
  tagset?: Tagset;
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
  references: ReferenceDetailsFragment[] | undefined;
  virtualContributors?: VirtualContributorProps[];
  hasReadPrivilege?: boolean;
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

const AboutPageContainer: FC<AboutPageContainerProps> = ({ journeyId, children }) => {
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
  const nonMemberContext = nonMembersData?.lookup.space?.context;
  const nonMemberProfile = nonMembersData?.lookup.space?.profile;
  const nonMemberCommunity = nonMembersData?.lookup.space?.community;

  const communityReadAccess =
    nonMemberCommunity?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read) ?? false;

  const {
    data: membersData,
    loading: membersDataLoading,
    error: membersDataError,
  } = useAboutPageMembersQuery({
    variables: {
      spaceId: journeyId!,
    },
    skip: nonMembersDataLoading || !journeyId || !communityReadAccess,
  });

  const memberProfile = membersData?.lookup.space?.profile;
  const virtualContributors = membersData?.lookup.space?.community.roleSet.memberVirtualContributors.filter(
    vc => vc.searchVisibility === SearchVisibility.Public
  );
  const hasReadPrivilege = membersData?.lookup.space?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.Read
  );

  const context = nonMemberContext;

  const nonMemberJourney = nonMembersData?.lookup.space;
  const nonMemberRoleSet = nonMemberJourney?.community.roleSet;
  const memberJourney = membersData?.lookup.space;
  const memberRoleset = memberJourney?.community.roleSet;

  const tagset = nonMemberJourney?.profile?.tagset;
  // TODO looks like space is missing
  const collaboration = nonMembersData?.lookup.space?.collaboration;

  const provider = nonMembersData?.lookup.space?.provider;
  const communityRoleSet: RoleSetMembers = {
    ...nonMemberRoleSet,
    ...memberRoleset,
  };
  const leadUsers = memberJourney?.community?.roleSet.leadUsers;
  const leadOrganizations = memberJourney?.community?.roleSet.leadOrganizations;
  const references = memberProfile?.references;

  const metrics = nonMemberJourney?.metrics;

  const membersCount = getMetricCount(metrics, MetricType.Member);
  const memberUsersCount = membersCount - (communityRoleSet.memberOrganizations?.length ?? 0); // Todo: may not be safe, better to simply report out metrics on member users + member orgs
  const contributors = useCommunityMembersAsCardProps(communityRoleSet, { memberUsersCount });

  const permissions: AboutPagePermissions = {
    communityReadAccess,
  };

  const loading = nonMembersDataLoading ?? membersDataLoading ?? false;
  const error = nonMembersDataError ?? membersDataError;

  const profile = useMemo(() => {
    return {
      id: nonMemberProfile?.id ?? '',
      displayName: nonMemberProfile?.displayName ?? '',
      description: nonMemberProfile?.description,
      tagset: nonMemberProfile?.tagset,
      visuals: nonMemberProfile?.visuals ?? [],
      tagline: nonMemberProfile?.tagline ?? '',
      url: nonMemberProfile?.url ?? '',
    };
  }, [nonMemberProfile]);

  return (
    <>
      {children(
        {
          context,
          profile,
          tagset,
          innovationFlow: collaboration?.innovationFlow,
          permissions,
          metrics,
          leadUsers,
          leadOrganizations,
          provider,
          references,
          virtualContributors,
          hasReadPrivilege,
          ...contributors,
        },
        { loading, error },
        {}
      )}
    </>
  );
};

export default AboutPageContainer;
