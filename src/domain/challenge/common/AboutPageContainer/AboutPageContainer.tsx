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
import { ContributorCardProps } from '../../../../common/components/composite/common/cards/ContributorCard/ContributorCard';
import { WithId } from '../../../../types/WithId';
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
  profile: Profile;
  tagset?: Tagset;
  lifecycle?: LifecycleContextTabFragment;
  permissions: AboutPagePermissions;
  metrics: MetricsItemFragment[] | undefined;
  memberUsers: WithId<ContributorCardProps>[] | undefined;
  memberUsersCount: number | undefined;
  memberOrganizations: WithId<ContributorCardProps>[] | undefined;
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
  hubNameId,
  challengeNameId,
  opportunityNameId,
}) => {
  const includeHub = !(challengeNameId || opportunityNameId);
  const includeChallenge = !!challengeNameId;
  const includeOpportunity = !!opportunityNameId;

  const {
    data: nonMembersData,
    loading: nonMembersDataLoading,
    error: nonMembersDataError,
  } = useAboutPageNonMembersQuery({
    variables: {
      hubNameId,
      challengeNameId,
      opportunityNameId,
      includeHub,
      includeChallenge,
      includeOpportunity,
    },
  });
  const nonMemberContext =
    nonMembersData?.hub?.opportunity?.context ??
    nonMembersData?.hub?.challenge?.context ??
    nonMembersData?.hub?.context;
  const nonMemberProfile =
    nonMembersData?.hub?.opportunity?.profile ??
    nonMembersData?.hub?.challenge?.profile ??
    nonMembersData?.hub?.profile;
  const nonMemberCommunity =
    nonMembersData?.hub?.opportunity?.community ??
    nonMembersData?.hub?.challenge?.community ??
    nonMembersData?.hub?.community;

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
      hubNameId,
      challengeNameId,
      opportunityNameId,
      includeHub,
      includeChallenge,
      includeOpportunity,
      referencesReadAccess,
      communityReadAccess,
    },
    skip: nonMembersDataLoading,
  });

  const memberProfile =
    membersData?.hub?.opportunity?.profile ?? membersData?.hub?.challenge?.profile ?? membersData?.hub?.profile;

  const context = nonMemberContext;

  const nonMemberJourney = nonMembersData?.hub?.opportunity ?? nonMembersData?.hub?.challenge ?? nonMembersData?.hub;
  const memberJourney = membersData?.hub?.opportunity ?? membersData?.hub?.challenge ?? membersData?.hub;

  const tagset = nonMemberJourney?.profile?.tagset;
  const lifecycle = (nonMembersData?.hub?.opportunity ?? nonMembersData?.hub?.challenge)?.lifecycle;
  const hostOrganization = nonMembersData?.hub?.host;
  const community = {
    ...nonMemberJourney?.community,
    ...memberJourney?.community,
  } as Community;
  const leadUsers = memberJourney?.community?.leadUsers;
  const leadOrganizations = memberJourney?.community?.leadOrganizations;
  const references = memberProfile?.references;

  const metrics = nonMemberJourney?.metrics;

  const membersCount = getMetricCount(metrics, MetricType.Member);
  const memberUsersCount = membersCount - (community.memberOrganizations?.length ?? 0);
  const contributors = useCommunityMembersAsCardProps(community, { memberUsersCount });

  const canCreateCommunityContextReview =
    nonMembersData?.hub?.challenge?.authorization?.myPrivileges?.includes(
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
      displayName: nonMemberProfile?.displayName || '',
      // description: nonMemberProfile?.description,
      tagset: nonMemberProfile?.tagset,
      visuals: nonMemberProfile?.visuals ?? [],
      tagline: nonMemberProfile?.tagline || '',
      // references: nonMemberProfile?.references ?? [],
      // location: nonMemberProfile?.location,
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
