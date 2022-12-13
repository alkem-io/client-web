import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../../core/container/container';
import {
  MetricsItemFragment,
  AuthorizationPrivilege,
  ContextTabFragment,
  LifecycleContextTabFragment,
  Scalars,
  Tagset, DashboardLeadUserFragment, AssociatedOrganizationDetailsFragment, ReferenceDetailsFragment,
} from '../../../core/apollo/generated/graphql-schema';
import {
  useChallengeContextQuery,
  useHubContextQuery,
  useOpportunityContextQuery,
} from '../../../core/apollo/generated/apollo-hooks';
import { useApolloErrorHandler } from '../../../core/apollo/hooks/useApolloErrorHandler';
import useCommunityMembersAsCardProps from '../../community/community/utils/useCommunityMembersAsCardProps';
import { WithId } from '../../../types/WithId';
import { ContributorCardProps } from '../../../common/components/composite/common/cards/ContributorCard/ContributorCard';

interface ContextTabPermissions {
  canCreateCommunityContextReview: boolean;
  communityReadAccess: boolean;
}

export interface ContextTabContainerEntities {
  context?: ContextTabFragment;
  tagset?: Tagset;
  lifecycle?: LifecycleContextTabFragment;
  permissions: ContextTabPermissions;
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

export interface ContextTabContainerActions {}

export interface ContextTabContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface ContextTabContainerProps
  extends ContainerChildProps<ContextTabContainerEntities, ContextTabContainerActions, ContextTabContainerState> {
  hubNameId: Scalars['UUID_NAMEID'];
  challengeNameId?: Scalars['UUID_NAMEID'];
  opportunityNameId?: Scalars['UUID_NAMEID'];
}
// todo rename related files & move to suitable folder
const AboutPageContainer: FC<ContextTabContainerProps> = ({
  children,
  hubNameId,
  challengeNameId = '',
  opportunityNameId = '',
}) => {
  const handleError = useApolloErrorHandler();

  const {
    data: hubData,
    loading: hubLoading,
    error: hubError,
  } = useHubContextQuery({
    variables: { hubNameId },
    skip: !!(challengeNameId || opportunityNameId),
    onError: handleError,
  });
  const hubContext = hubData?.hub?.context;
  const hugTagset = hubData?.hub?.tagset;
  const hubCommunity = hubData?.hub.community;
  const hubCommunityReadAccess = hubCommunity?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);

  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
  } = useChallengeContextQuery({
    variables: { hubNameId, challengeNameId },
    skip: !challengeNameId || !!opportunityNameId,
    onError: handleError,
  });
  const challengeContext = challengeData?.hub?.challenge?.context;
  const challengeTagset = challengeData?.hub?.challenge?.tagset;
  const challengeLifecycle = challengeData?.hub?.challenge?.lifecycle;
  const challengeCommunity = challengeData?.hub.challenge?.community;
  const challengePrivileges = challengeData?.hub.challenge?.authorization?.myPrivileges ?? [];
  const canCreateCommunityContextReview = challengePrivileges.includes(AuthorizationPrivilege.CommunityContextReview);
  const challengeCommunityReadAccess = challengeCommunity?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);

  const {
    data: opportunityData,
    loading: opportunityLoading,
    error: opportunityError,
  } = useOpportunityContextQuery({
    variables: { hubNameId, opportunityNameId },
    skip: !opportunityNameId,
    onError: handleError,
  });
  const opportunityContext = opportunityData?.hub?.opportunity?.context;
  const opportunityTagset = opportunityData?.hub?.opportunity?.tagset;
  const opportunityLifecycle = opportunityData?.hub?.opportunity?.lifecycle;
  const opportunityCommunity = opportunityData?.hub.opportunity?.community;
  const opportunityCommunityReadAccess =
    opportunityCommunity?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);

  const context = hubContext ?? challengeContext ?? opportunityContext;
  const tagset = hugTagset ?? challengeTagset ?? opportunityTagset;
  const lifecycle = challengeLifecycle ?? opportunityLifecycle;
  const community = hubCommunity ?? challengeCommunity ?? opportunityCommunity;
  const communityReadAccess = hubCommunityReadAccess ?? challengeCommunityReadAccess ?? opportunityCommunityReadAccess ?? false;
  const leadUsers = community?.leadUsers;
  const leadOrganizations = community?.leadOrganizations;
  const hostOrganization = hubData?.hub?.host;
  const loading = hubLoading || challengeLoading || opportunityLoading;
  const error = hubError ?? challengeError ?? opportunityError;

  const { metrics } = hubData?.hub ?? challengeData?.hub.challenge ?? opportunityData?.hub.opportunity ?? {};

  const permissions: ContextTabPermissions = {
    canCreateCommunityContextReview,
    communityReadAccess
  };

  const contributors = useCommunityMembersAsCardProps(community);

  return (
    <>
      {children(
      {
        context, tagset, lifecycle, permissions, metrics,
        leadUsers, leadOrganizations, hostOrganization,
        references: [], // todo implement
        ...contributors
      },
      { loading, error },
      {}
      )}
    </>
  );
};
export default AboutPageContainer;
