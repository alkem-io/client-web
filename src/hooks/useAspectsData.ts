import { useMemo } from 'react';
import { useApolloErrorHandler, useHub } from './index';
import {
  usePrivilegesOnHubCollaborationQuery,
  useHubAspectsQuery,
  usePrivilegesOnChallengeCollaborationQuery,
  useChallengeAspectsQuery,
  usePrivilegesOnOpportunityCollaborationQuery,
  useOpportunityAspectsQuery,
} from './generated/graphql';
import { AuthorizationPrivilege } from '../models/graphql-schema';
import { AspectWithPermissions, EntityIds } from '../containers/ContributeTabContainer/ContributeTabContainer';
import useCalloutAspectCreatedSubscription from '../domain/collaboration/useCalloutAspectCreatedSubscription';
import { ApolloError } from '@apollo/client';
import { getAspectCallout } from '../containers/aspect/get-aspect-callout';

export interface AspectsData {
  aspects: AspectWithPermissions[] | undefined;
  loading: boolean;
  error: ApolloError | undefined;
  canReadAspects: boolean;
  canCreateAspects: boolean;
  calloutId: string | undefined;
  subscriptionEnabled: boolean;
}

export const useAspectsData = ({
  hubNameId,
  challengeNameId = undefined,
  opportunityNameId = undefined,
}: EntityIds): AspectsData => {
  const handleError = useApolloErrorHandler();
  const { loading: hubLoading } = useHub();

  const {
    data: hubCollaborationData,
    loading: hubCollaborationLoading,
    error: hubCollaborationError,
  } = usePrivilegesOnHubCollaborationQuery({
    variables: { hubNameId },
    skip: !!(challengeNameId || opportunityNameId),
    onError: handleError,
  });
  const hubCollaboration = hubCollaborationData?.hub?.collaboration;
  const hubCollaborationPrivileges = hubCollaboration?.authorization?.myPrivileges;
  const canReadHubCollaboration = hubCollaborationPrivileges?.includes(AuthorizationPrivilege.Read);
  const canCreateAspectOnHub = hubCollaborationPrivileges?.includes(AuthorizationPrivilege.CreateAspect);
  const {
    data: hubAspectData,
    loading: hubAspectLoading,
    error: hubAspectError,
    subscribeToMore: subscribeToHub,
  } = useHubAspectsQuery({
    variables: { hubNameId },
    skip: !canReadHubCollaboration || !!(challengeNameId || opportunityNameId),
    onError: handleError,
  });
  const hubCallout = getAspectCallout(hubAspectData?.hub?.collaboration?.callouts);
  const hubAspects = hubCallout?.aspects;

  const {
    data: challengeCollaborationData,
    loading: challengeCollaborationLoading,
    error: challengeCollaborationError,
  } = usePrivilegesOnChallengeCollaborationQuery({
    variables: { hubNameId, challengeNameId: challengeNameId ?? '' },
    skip: !challengeNameId || !!opportunityNameId,
    onError: handleError,
  });
  const challengeCollaboration = challengeCollaborationData?.hub?.challenge?.collaboration;
  const challengeCollaborationPrivileges = challengeCollaboration?.authorization?.myPrivileges;
  const canReadChallengeCollaboration = challengeCollaborationPrivileges?.includes(AuthorizationPrivilege.Read);
  const canCreateAspectOnChallenge = challengeCollaborationPrivileges?.includes(AuthorizationPrivilege.CreateAspect);

  const {
    data: challengeAspectData,
    loading: challengeAspectLoading,
    error: challengeAspectError,
    subscribeToMore: subscribeToChallenges,
  } = useChallengeAspectsQuery({
    variables: { hubNameId, challengeNameId: challengeNameId ?? '' },
    skip: !canReadChallengeCollaboration || !challengeNameId || !!opportunityNameId,
    onError: handleError,
  });
  const challengeCallout = getAspectCallout(challengeAspectData?.hub?.challenge?.collaboration?.callouts);
  const challengeAspects = challengeCallout?.aspects;

  const {
    data: opportunityCollaborationData,
    loading: opportunityCollaborationLoading,
    error: opportunityCollaborationError,
  } = usePrivilegesOnOpportunityCollaborationQuery({
    variables: { hubNameId, opportunityNameId: opportunityNameId ?? '' },
    skip: !opportunityNameId,
    onError: handleError,
  });
  const opportunityCollaboration = opportunityCollaborationData?.hub?.opportunity?.collaboration;
  const opportunityCollaborationPrivileges = opportunityCollaboration?.authorization?.myPrivileges;
  const canReadOpportunityCollaboration = opportunityCollaborationPrivileges?.includes(AuthorizationPrivilege.Read);
  const canCreateAspectOnOpportunity = opportunityCollaborationPrivileges?.includes(
    AuthorizationPrivilege.CreateAspect
  );

  const {
    data: opportunityAspectData,
    loading: opportunityAspectLoading,
    error: opportunityAspectError,
    subscribeToMore: subscribeToOpportunity,
  } = useOpportunityAspectsQuery({
    variables: { hubNameId, opportunityNameId: opportunityNameId ?? '' },
    skip: !canReadOpportunityCollaboration || !opportunityNameId,
    onError: handleError,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });
  const opportunityCallout = getAspectCallout(opportunityAspectData?.hub?.opportunity?.collaboration?.callouts);
  const opportunityAspects = opportunityCallout?.aspects;

  const hubAspectSubscription = useCalloutAspectCreatedSubscription(
    hubAspectData,
    hubData => getAspectCallout(hubData?.hub?.collaboration?.callouts),
    subscribeToHub
  );
  const challengeAspectSubscription = useCalloutAspectCreatedSubscription(
    challengeAspectData,
    challengeData => getAspectCallout(challengeData?.hub?.challenge?.collaboration?.callouts),
    subscribeToChallenges
  );
  const opportunityAspectSubscription = useCalloutAspectCreatedSubscription(
    opportunityAspectData,
    opportunityData => getAspectCallout(opportunityData?.hub?.opportunity?.collaboration?.callouts),
    subscribeToOpportunity
  );

  const isSubscriptionEnabled =
    hubAspectSubscription.enabled || challengeAspectSubscription.enabled || opportunityAspectSubscription.enabled;

  const aspects: AspectWithPermissions[] | undefined = useMemo(
    () =>
      (hubAspects ?? challengeAspects ?? opportunityAspects)?.map(x => ({
        ...x,
        canDelete: x?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Delete),
      })),
    [hubAspects, challengeAspects, opportunityAspects]
  );

  const loading =
    hubCollaborationLoading ||
    challengeCollaborationLoading ||
    opportunityCollaborationLoading ||
    hubAspectLoading ||
    challengeAspectLoading ||
    opportunityAspectLoading ||
    hubLoading;

  const error =
    hubCollaborationError ??
    challengeCollaborationError ??
    opportunityCollaborationError ??
    hubAspectError ??
    challengeAspectError ??
    opportunityAspectError;

  const canReadAspects =
    canReadHubCollaboration ?? canReadChallengeCollaboration ?? canReadOpportunityCollaboration ?? true;
  const canCreateAspects = canCreateAspectOnHub ?? canCreateAspectOnChallenge ?? canCreateAspectOnOpportunity ?? false;

  const calloutId = hubCallout?.id ?? challengeCallout?.id ?? opportunityCallout?.id;

  return {
    aspects,
    loading,
    error,
    canReadAspects,
    canCreateAspects,
    calloutId,
    subscriptionEnabled: isSubscriptionEnabled,
  };
};
