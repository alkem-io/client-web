import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../../core/container/container';
import {
  MetricsItemFragment,
  AuthorizationPrivilege,
  ContextTabFragment,
  LifecycleContextTabFragment,
  Scalars,
  Tagset,
  DashboardLeadUserFragment,
  AssociatedOrganizationDetailsFragment,
  ReferenceDetailsFragment,
} from '../../../core/apollo/generated/graphql-schema';
import {
  useAboutPageMembersQuery,
  useAboutPageNonMembersQuery,
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
  challengeNameId,
  opportunityNameId,
}) => {
  const handleError = useApolloErrorHandler();

  const { data: nonMembersData, loading: nonMembersDataLoading, error: nonMembersDataError } = useAboutPageNonMembersQuery({
    variables: {
      hubNameId, challengeNameId, opportunityNameId,
      includeChallenge: !!challengeNameId,
      includeOpportunity: !!opportunityNameId,
    },
    onError: handleError,
  });
  const nonMemberContext = nonMembersData?.hub?.context
    ?? nonMembersData?.hub?.challenge?.context
    ?? nonMembersData?.hub?.opportunity?.context;
  const nonMemberCommunity = nonMembersData?.hub?.community
    ?? nonMembersData?.hub?.challenge?.community
    ?? nonMembersData?.hub?.opportunity?.community;

  const referencesReadAccess = nonMemberContext?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read) ?? false;
  const communityReadAccess = nonMemberCommunity?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read) ?? false;

  const { data: membersData, loading: membersDataLoading, error: membersDataError } = useAboutPageMembersQuery({
    variables: {
      hubNameId, challengeNameId, opportunityNameId,
      includeChallenge: !!challengeNameId,
      includeOpportunity: !!opportunityNameId,
      referencesReadAccess,
      communityReadAccess,
    },
    onError: handleError,
  });
  const memberContext = membersData?.hub?.context
    ?? membersData?.hub?.challenge?.context
      ?? membersData?.hub?.opportunity?.context;

  const context = nonMemberContext;

  const nonMemberJourney = nonMembersData?.hub?.opportunity ?? nonMembersData?.hub?.challenge ?? nonMembersData?.hub;
  const memberJourney = membersData?.hub?.opportunity ?? membersData?.hub?.challenge ?? membersData?.hub;

  const tagset = nonMemberJourney?.tagset;
  const lifecycle = (nonMembersData?.hub?.opportunity ?? nonMembersData?.hub?.challenge)?.lifecycle;
  const hostOrganization = nonMembersData?.hub?.host;
  const community = {
    ...nonMemberJourney?.community,
    ...memberJourney?.community,
  };
  const leadUsers = memberJourney?.community?.leadUsers;
  const leadOrganizations = memberJourney?.community?.leadOrganizations;
  const references = memberContext?.references;
  //
  const metrics = nonMemberJourney?.metrics;

  const contributors = useCommunityMembersAsCardProps(community);

  const canCreateCommunityContextReview =
    nonMembersData?.hub?.challenge?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CommunityContextReview) ?? false;

  const permissions: ContextTabPermissions = {
    canCreateCommunityContextReview,
    communityReadAccess
  };

  const loading = nonMembersDataLoading ?? membersDataLoading ?? false;
  const error = nonMembersDataError ?? membersDataError;

  return (
    <>
      {children(
      {
        context, tagset, lifecycle, permissions, metrics,
        leadUsers, leadOrganizations, hostOrganization,
        references,
        ...contributors
      },
      { loading, error },
      {}
      )}
    </>
  );
};
export default AboutPageContainer;
