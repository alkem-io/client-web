import React, { FC, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import {
  AssociatedOrganizationDetailsFragment,
  AuthorizationPrivilege,
  Community,
  ContextTabFragment,
  DashboardLeadUserFragment,
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
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';
import { InnovationFlowDetails } from '../../../collaboration/InnovationFlow/InnovationFlow';
import { JourneyTypeName } from '../../JourneyTypeName';

interface AboutPagePermissions {
  canCreateCommunityContextReview: boolean;
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
  extends ContainerChildProps<AboutPageContainerEntities, AboutPageContainerActions, AboutPageContainerState> {
  journeyId: string | undefined;
  journeyTypeName: JourneyTypeName;
}

const AboutPageContainer: FC<AboutPageContainerProps> = ({ journeyId, journeyTypeName, children }) => {
  const includeSpace = journeyTypeName === 'space';
  const includeChallenge = journeyTypeName === 'challenge';
  const includeOpportunity = journeyTypeName === 'opportunity';

  const {
    data: nonMembersData,
    loading: nonMembersDataLoading,
    error: nonMembersDataError,
  } = useAboutPageNonMembersQuery({
    variables: {
      spaceId: journeyId,
      challengeId: journeyId,
      opportunityId: journeyId,
      includeSpace,
      includeChallenge,
      includeOpportunity,
    },
  });
  const nonMemberContext =
    nonMembersData?.lookup.opportunity?.context ??
    nonMembersData?.lookup.challenge?.context ??
    nonMembersData?.space?.context;
  const nonMemberProfile =
    nonMembersData?.lookup.opportunity?.profile ??
    nonMembersData?.lookup.challenge?.profile ??
    nonMembersData?.space?.profile;
  const nonMemberCommunity =
    nonMembersData?.lookup.opportunity?.community ??
    nonMembersData?.lookup.challenge?.community ??
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
      spaceId: journeyId,
      challengeId: journeyId,
      opportunityId: journeyId,
      includeSpace,
      includeChallenge,
      includeOpportunity,
      referencesReadAccess,
      communityReadAccess,
    },
    skip: nonMembersDataLoading,
  });

  const memberProfile =
    membersData?.lookup.opportunity?.profile ?? membersData?.lookup.challenge?.profile ?? membersData?.space?.profile;

  const context = nonMemberContext;

  const nonMemberJourney =
    nonMembersData?.lookup.opportunity ?? nonMembersData?.lookup.challenge ?? nonMembersData?.space;
  const memberJourney = membersData?.lookup.opportunity ?? membersData?.lookup.challenge ?? membersData?.space;

  const tagset = nonMemberJourney?.profile?.tagset;
  // TODO looks like space is missing
  const collaboration = (nonMembersData?.lookup.opportunity ?? nonMembersData?.lookup.challenge)?.collaboration;

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
    nonMembersData?.lookup.challenge?.authorization?.myPrivileges?.includes(
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
