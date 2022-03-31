import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerProps } from '../../models/container';
import {
  AspectCardFragment,
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
  canReadAspects: boolean;
  canCreateAspects: boolean;
  canCreateCommunityContextReview: boolean;
}

export interface ContextTabContainerEntities {
  context?: ContextTabFragment;
  tagset?: Tagset;
  lifecycle?: LifecycleContextTabFragment;
  aspects?: AspectCardFragment[];
  references?: ReferenceContextTabFragment[];
  permissions: ContextTabPermissions;
}

export interface ContextTabContainerActions {}

export interface ContextTabContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface ContextTabContainerProps
  extends ContainerProps<ContextTabContainerEntities, ContextTabContainerActions, ContextTabContainerState> {
  hubNameId: Scalars['UUID_NAMEID'];
  challengeNameId?: Scalars['UUID_NAMEID'];
  opportunityNameId?: Scalars['UUID_NAMEID'];
  loadAspectsAndReferences?: boolean;
}

const ContextTabContainer: FC<ContextTabContainerProps> = ({
  children,
  hubNameId,
  challengeNameId = '',
  opportunityNameId = '',
  loadAspectsAndReferences = false,
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
    skip: !loadAspectsAndReferences || !!(challengeNameId || opportunityNameId),
    onError: handleError,
  });
  const hubContext = hubData?.hub?.context;
  const hugTagset = hubData?.hub?.tagset;
  const hubAspects = hubExtra?.hub?.context?.aspects;
  const hubReferences = hubExtra?.hub?.context?.references;
  const hubContextPrivileges = hubContext && (hubContext?.authorization?.myPrivileges ?? []);
  const canReadHubContext = hubContextPrivileges && hubContextPrivileges.includes(AuthorizationPrivilege.Read);
  const canCreateAspectOnHub =
    hubContextPrivileges && hubContextPrivileges.includes(AuthorizationPrivilege.CreateAspect);

  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
  } = useChallengeContextQuery({
    variables: { hubNameId, challengeNameId },
    skip: !challengeNameId,
    onError: handleError,
  });
  const {
    data: challengeExtra,
    loading: challengeExtraLoading,
    error: challengeExtraError,
  } = useChallengeContextExtraQuery({
    variables: { hubNameId, challengeNameId },
    skip: !loadAspectsAndReferences || !challengeNameId,
    onError: handleError,
  });
  const challengeContext = challengeData?.hub?.challenge?.context;
  const challengeTagset = challengeData?.hub?.challenge?.tagset;
  const challengeLifecycle = challengeData?.hub?.challenge?.lifecycle;
  const challengeAspects = challengeExtra?.hub?.challenge?.context?.aspects;
  const challengeReferences = challengeExtra?.hub?.challenge?.context?.references;
  const challengeContextPrivileges = challengeContext && (challengeContext?.authorization?.myPrivileges ?? []);
  const canReadChallengeContext =
    challengeContextPrivileges && challengeContextPrivileges.includes(AuthorizationPrivilege.Read);
  const canCreateAspectOnChallenge =
    challengeContextPrivileges && challengeContextPrivileges.includes(AuthorizationPrivilege.CreateAspect);
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
    skip: !loadAspectsAndReferences || !opportunityNameId,
    onError: handleError,
  });
  const opportunityContext = opportunityData?.hub?.opportunity?.context;
  const opportunityTagset = opportunityData?.hub?.opportunity?.tagset;
  const opportunityLifecycle = opportunityData?.hub?.opportunity?.lifecycle;
  const opportunityAspects = opportunityExtra?.hub?.opportunity?.context?.aspects;
  const opportunityReferences = opportunityExtra?.hub?.opportunity?.context?.references;
  const opportunityContextPrivileges = opportunityContext && (opportunityContext?.authorization?.myPrivileges ?? []);
  const canReadOpportunityContext =
    opportunityContextPrivileges && opportunityContextPrivileges.includes(AuthorizationPrivilege.Read);
  const canCreateAspectOnOpportunity =
    opportunityContextPrivileges && opportunityContextPrivileges.includes(AuthorizationPrivilege.CreateAspect);

  const context = hubContext ?? challengeContext ?? opportunityContext;
  const tagset = hugTagset ?? challengeTagset ?? opportunityTagset;
  const lifecycle = challengeLifecycle ?? opportunityLifecycle;
  const aspects = hubAspects ?? challengeAspects ?? opportunityAspects;
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
    canReadAspects: canReadHubContext ?? canReadChallengeContext ?? canReadOpportunityContext ?? true,
    canCreateAspects: canCreateAspectOnHub ?? canCreateAspectOnChallenge ?? canCreateAspectOnOpportunity ?? false,
    canCreateCommunityContextReview,
  };

  return <>{children({ context, tagset, lifecycle, aspects, references, permissions }, { loading, error }, {})}</>;
};
export default ContextTabContainer;
