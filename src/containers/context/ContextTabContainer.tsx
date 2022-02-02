import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerProps } from '../../models/container';
import {
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
  canReadAspects: boolean;
}

export interface ContextTabContainerEntities {
  context?: ContextTabFragment;
  tagset?: Tagset;
  lifecycle?: LifecycleContextTabFragment;
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
  const hubContext = hubData?.ecoverse?.context;
  const hugTagset = hubData?.ecoverse?.tagset;
  const canReadHubContext =
    hubContext && (hubContext?.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Read);

  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
  } = useChallengeContextQuery({
    variables: { hubNameId, challengeNameId },
    skip: !challengeNameId,
    onError: handleError,
  });
  const challengeContext = challengeData?.ecoverse?.challenge?.context;
  const challengeTagset = challengeData?.ecoverse?.challenge?.tagset;
  const challengeLifecycle = challengeData?.ecoverse?.challenge?.lifecycle;
  const canReadChallengeContext =
    challengeContext && (challengeContext?.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Read);

  const {
    data: opportunityData,
    loading: opportunityLoading,
    error: opportunityError,
  } = useOpportunityContextQuery({
    variables: { hubNameId, opportunityNameId },
    skip: !opportunityNameId,
    onError: handleError,
  });
  const opportunityContext = opportunityData?.ecoverse?.opportunity?.context;
  const opportunityTagset = opportunityData?.ecoverse?.opportunity?.tagset;
  const opportunityLifecycle = opportunityData?.ecoverse?.opportunity?.lifecycle;
  const canReadOpportunityContext =
    opportunityContext && (opportunityContext?.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Read);

  const context = hubContext ?? challengeContext ?? opportunityContext;
  const tagset = hugTagset ?? challengeTagset ?? opportunityTagset;
  const lifecycle = challengeLifecycle ?? opportunityLifecycle;
  const loading = hubLoading ?? challengeLoading ?? opportunityLoading ?? false;
  const error = hubError ?? challengeError ?? opportunityError;

  const permissions: ContextTabPermissions = {
    canReadAspects: canReadHubContext ?? canReadChallengeContext ?? canReadOpportunityContext ?? true,
  };

  return <>{children({ context, tagset, lifecycle, permissions }, { loading, error }, {})}</>;
};
export default ContextTabContainer;
