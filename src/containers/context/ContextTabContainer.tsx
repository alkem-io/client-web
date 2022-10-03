import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../models/container';
import {
  MetricsItemFragment,
  AuthorizationPrivilege,
  ContextTabFragment,
  LifecycleContextTabFragment,
  Scalars,
  Tagset,
} from '../../models/graphql-schema';
import {
  useChallengeContextQuery,
  useHubContextQuery,
  useOpportunityContextQuery,
} from '../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../hooks';

interface ContextTabPermissions {
  canCreateCommunityContextReview: boolean;
}

export interface ContextTabContainerEntities {
  context?: ContextTabFragment;
  tagset?: Tagset;
  lifecycle?: LifecycleContextTabFragment;
  permissions: ContextTabPermissions;
  metrics: MetricsItemFragment[] | undefined;
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

const ContextTabContainer: FC<ContextTabContainerProps> = ({
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
  const challengePrivileges = challengeData?.hub.challenge?.authorization?.myPrivileges ?? [];
  const canCreateCommunityContextReview = challengePrivileges.includes(AuthorizationPrivilege.CommunityContextReview);

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

  const context = hubContext ?? challengeContext ?? opportunityContext;
  const tagset = hugTagset ?? challengeTagset ?? opportunityTagset;
  const lifecycle = challengeLifecycle ?? opportunityLifecycle;
  const loading = hubLoading || challengeLoading || opportunityLoading;
  const error = hubError ?? challengeError ?? opportunityError;

  const { metrics } = hubData?.hub ?? challengeData?.hub.challenge ?? opportunityData?.hub.opportunity ?? {};

  const permissions: ContextTabPermissions = {
    canCreateCommunityContextReview,
  };

  return <>{children({ context, tagset, lifecycle, permissions, metrics }, { loading, error }, {})}</>;
};
export default ContextTabContainer;
