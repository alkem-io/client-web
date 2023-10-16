import React, { FC, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import {
  AssociatedOrganizationDetailsFragment,
  AuthorizationPrivilege,
  Community,
  ContextTabFragment,
  DashboardLeadUserFragment,
  LifecycleContextTabFragment,
  MetricsItemFragment,
  Profile,
  ReferenceDetailsFragment,
  Tagset,
} from '../../../../core/apollo/generated/graphql-schema';
import { ContributorCardSquareProps } from '../../../community/contributor/ContributorCardSquare/ContributorCardSquare';
import { WithId } from '../../../../core/utils/WithId';
import useCommunityMembersAsCardProps from '../../../community/community/utils/useCommunityMembersAsCardProps';
import { ContainerChildProps } from '../../../../core/container/container';
import { useAboutPageMembersQuery, useAboutPageNonMembersQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { CoreEntityIdTypes } from '../../../shared/types/CoreEntityIds';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';

interface AboutPagePermissions {
  canCreateCommunityContextReview: boolean;
  communityReadAccess: boolean;
}

export interface AboutPageContainerEntities {
  context?: ContextTabFragment;
  profile: Omit<Profile, 'storageBucket' | 'url'>;
  tagset?: Tagset;
  lifecycle?: LifecycleContextTabFragment;
  permissions: AboutPagePermissions;
  metrics: MetricsItemFragment[] | undefined;
  memberUsers: WithId<ContributorCardSquareProps>[] | undefined;
  memberUsersCount: number | undefined;
  memberOrganizations: WithId<ContributorCardSquareProps>[] | undefined;
  memberOrganizationsCount: number | undefined;
  leadUsers: DashboardLeadUserFragment[] | undefined;
  leadOrganizations: AssociatedOrganizationDetailsFragment[] | undefined;
  hostOrganization: AssociatedOrganizationDetailsFragment | undefined;
  references: ReferenceDetailsFragment[] | undefined;
}

export interface AboutPageContainerActions {}

export interface AboutPageContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface AboutPageContainerProps
  extends ContainerChildProps<AboutPageContainerEntities, AboutPageContainerActions, AboutPageContainerState>,
    CoreEntityIdTypes {}

const AboutPageContainer: FC<AboutPageContainerProps> = ({
  children,
  spaceNameId,
  challengeNameId,
  opportunityNameId,
}) => {
  const includeSpace = !(challengeNameId || opportunityNameId);
  const includeChallenge = !!challengeNameId;
  const includeOpportunity = !!opportunityNameId;

  const {
    data: nonMembersData,
    loading: nonMembersDataLoading,
    error: nonMembersDataError,
  } = useAboutPageNonMembersQuery({
    variables: {
      spaceNameId,
      challengeNameId,
      opportunityNameId,
      includeSpace,
      includeChallenge,
      includeOpportunity,
    },
  });
  const nonMemberContext =
    nonMembersData?.space?.opportunity?.context ??
    nonMembersData?.space?.challenge?.context ??
    nonMembersData?.space?.context;
  const nonMemberProfile =
    nonMembersData?.space?.opportunity?.profile ??
    nonMembersData?.space?.challenge?.profile ??
    nonMembersData?.space?.profile;
  const nonMemberCommunity =
    nonMembersData?.space?.opportunity?.community ??
    nonMembersData?.space?.challenge?.community ??
    nonMembersData?.space?.community;

  const referencesReadAccess =
    nonMemberContext?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read) ?? false;
  const communityReadAccess =
    nonMemberCommunity?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read) ?? false;

  const {
    data: membersData,
    loading: membersDataLoading,
    error: membersDataError,
  } = useAboutPageMembersQuery({
    variables: {
      spaceNameId,
      challengeNameId,
      opportunityNameId,
      includeSpace,
      includeChallenge,
      includeOpportunity,
      referencesReadAccess,
      communityReadAccess,
    },
    skip: nonMembersDataLoading,
  });

  const memberProfile =
    membersData?.space?.opportunity?.profile ?? membersData?.space?.challenge?.profile ?? membersData?.space?.profile;

  const context = nonMemberContext;

  const nonMemberJourney =
    nonMembersData?.space?.opportunity ?? nonMembersData?.space?.challenge ?? nonMembersData?.space;
  const memberJourney = membersData?.space?.opportunity ?? membersData?.space?.challenge ?? membersData?.space;

  const tagset = nonMemberJourney?.profile?.tagset;
  const lifecycle = (nonMembersData?.space?.opportunity ?? nonMembersData?.space?.challenge)?.innovationFlow?.lifecycle;
  const hostOrganization = nonMembersData?.space?.host;
  const community = {
    ...nonMemberJourney?.community,
    ...memberJourney?.community,
  } as Community;
  const leadUsers = memberJourney?.community?.leadUsers;
  const leadOrganizations = memberJourney?.community?.leadOrganizations;
  const references = memberProfile?.references;

  const metrics = nonMemberJourney?.metrics;

  const membersCount = getMetricCount(metrics, MetricType.Member);
  const memberUsersCount = membersCount - (community.organizationsInRole?.length ?? 0); // Todo: may not be safe, better to simply report out metrics on member users + member orgs
  const contributors = useCommunityMembersAsCardProps(community, { memberUsersCount });

  const canCreateCommunityContextReview =
    nonMembersData?.space?.challenge?.authorization?.myPrivileges?.includes(
      AuthorizationPrivilege.CommunityContextReview
    ) ?? false;

  const permissions: AboutPagePermissions = {
    canCreateCommunityContextReview,
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
    };
  }, [nonMemberProfile]);

  return (
    <>
      {children(
        {
          context,
          profile,
          tagset,
          lifecycle,
          permissions,
          metrics,
          leadUsers,
          leadOrganizations,
          hostOrganization,
          references,
          ...contributors,
        },
        { loading, error },
        {}
      )}
    </>
  );
};

export default AboutPageContainer;
