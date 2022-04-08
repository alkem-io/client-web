import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../models/container';
import {
  AuthorizationPrivilege,
  ContextTabFragment,
  LifecycleContextTabFragment,
  ReferenceContextTabFragment,
  Scalars,
  Tagset,
} from '../../models/graphql-schema';
import {
  useChallengeContextExtraQuery,
  useChallengeContextQuery,
  useHubContextExtraQuery,
  useHubContextQuery,
  useOpportunityContextExtraQuery,
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
  references?: ReferenceContextTabFragment[];
  permissions: ContextTabPermissions;
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
  loadReferences?: boolean;
}

const ContextTabContainer: FC<ContextTabContainerProps> = ({
  children,
  hubNameId,
  challengeNameId = '',
  opportunityNameId = '',
  loadReferences = false,
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
  const {
    data: hubExtra,
    loading: hubExtraLoading,
    error: hubExtraError,
  } = useHubContextExtraQuery({
    variables: { hubNameId },
    skip: !loadReferences || !!(challengeNameId || opportunityNameId),
    onError: handleError,
  });
  const hubContext = hubData?.hub?.context;
  const hugTagset = hubData?.hub?.tagset;
  const hubReferences = hubExtra?.hub?.context?.references;

  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
  } = useChallengeContextQuery({
    variables: { hubNameId, challengeNameId },
    skip: !challengeNameId || !!opportunityNameId,
    onError: handleError,
  });
  const {
    data: challengeExtra,
    loading: challengeExtraLoading,
    error: challengeExtraError,
  } = useChallengeContextExtraQuery({
    variables: { hubNameId, challengeNameId },
    skip: !loadReferences || !challengeNameId || !!opportunityNameId,
    onError: handleError,
  });
  const challengeContext = challengeData?.hub?.challenge?.context;
  const challengeTagset = challengeData?.hub?.challenge?.tagset;
  const challengeLifecycle = challengeData?.hub?.challenge?.lifecycle;
  const challengeReferences = challengeExtra?.hub?.challenge?.context?.references;
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
  const {
    data: opportunityExtra,
    loading: opportunityExtraLoading,
    error: opportunityExtraError,
  } = useOpportunityContextExtraQuery({
    variables: { hubNameId, opportunityNameId },
    skip: !loadReferences || !opportunityNameId,
    onError: handleError,
  });
  const opportunityContext = opportunityData?.hub?.opportunity?.context;
  const opportunityTagset = opportunityData?.hub?.opportunity?.tagset;
  const opportunityLifecycle = opportunityData?.hub?.opportunity?.lifecycle;
  const opportunityReferences = opportunityExtra?.hub?.opportunity?.context?.references;

  const context = hubContext ?? challengeContext ?? opportunityContext;
  const tagset = hugTagset ?? challengeTagset ?? opportunityTagset;
  const lifecycle = challengeLifecycle ?? opportunityLifecycle;
  const references = hubReferences ?? challengeReferences ?? opportunityReferences;
  const loading =
    hubLoading ||
    hubExtraLoading ||
    challengeLoading ||
    challengeExtraLoading ||
    opportunityLoading ||
    opportunityExtraLoading;
  const error =
    hubError ?? hubExtraError ?? challengeError ?? challengeExtraError ?? opportunityError ?? opportunityExtraError;

  const permissions: ContextTabPermissions = {
    canCreateCommunityContextReview,
  };

  return <>{children({ context, tagset, lifecycle, references, permissions }, { loading, error }, {})}</>;
};
export default ContextTabContainer;
