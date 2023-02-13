import {
  useChallengeCalloutAspectsSubscriptionQuery,
  useHubCalloutAspectsSubscriptionQuery,
  useOpportunityCalloutAspectsSubscriptionQuery,
  usePrivilegesOnChallengeCollaborationQuery,
  usePrivilegesOnHubCollaborationQuery,
  usePrivilegesOnOpportunityCollaborationQuery,
} from '../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  ContributeTabAspectFragment,
  Scalars,
} from '../../../core/apollo/generated/graphql-schema';
import useCalloutAspectCreatedSubscription from '../collaboration/useCalloutAspectCreatedSubscription';

export interface AspectsData {
  subscriptionEnabled: boolean;
  aspects: ContributeTabAspectFragment[] | undefined;
  loading: boolean;
}

interface UseAspectDataHookProps {
  hubNameId: Scalars['UUID_NAMEID'];
  calloutId: Scalars['UUID_NAMEID'];
  challengeNameId?: Scalars['UUID_NAMEID'];
  opportunityNameId?: Scalars['UUID_NAMEID'];
  skip?: boolean;
}

export const useAspectCreatedOnCalloutSubscription = ({
  hubNameId,
  calloutId,
  challengeNameId = undefined,
  opportunityNameId = undefined,
  skip = false,
}: UseAspectDataHookProps): AspectsData => {
  const { data: hubCollaborationData } = usePrivilegesOnHubCollaborationQuery({
    variables: { hubNameId },
    skip: !!(challengeNameId || opportunityNameId),
  });
  const hubCollaboration = hubCollaborationData?.hub?.collaboration;
  const hubCollaborationPrivileges = hubCollaboration?.authorization?.myPrivileges;
  const canReadHubCollaboration = hubCollaborationPrivileges?.includes(AuthorizationPrivilege.Read);
  const {
    data: hubAspectData,
    subscribeToMore: subscribeToHub,
    loading: hubAspectDataLoading,
  } = useHubCalloutAspectsSubscriptionQuery({
    variables: { hubNameId, calloutId },
    skip: !canReadHubCollaboration || !!(challengeNameId || opportunityNameId) || skip,
  });

  const { data: challengeCollaborationData } = usePrivilegesOnChallengeCollaborationQuery({
    variables: { hubNameId, challengeNameId: challengeNameId! },
    skip: !challengeNameId || !!opportunityNameId,
  });
  const challengeCollaboration = challengeCollaborationData?.hub?.challenge?.collaboration;
  const challengeCollaborationPrivileges = challengeCollaboration?.authorization?.myPrivileges;
  const canReadChallengeCollaboration = challengeCollaborationPrivileges?.includes(AuthorizationPrivilege.Read);

  const {
    data: challengeAspectData,
    subscribeToMore: subscribeToChallenges,
    loading: challengeAspectDataLoading,
  } = useChallengeCalloutAspectsSubscriptionQuery({
    variables: { hubNameId, calloutId, challengeNameId: challengeNameId! },
    skip: !canReadChallengeCollaboration || !challengeNameId || !!opportunityNameId || skip,
  });

  const { data: opportunityCollaborationData } = usePrivilegesOnOpportunityCollaborationQuery({
    variables: { hubNameId, opportunityNameId: opportunityNameId! },
    skip: !opportunityNameId,
  });
  const opportunityCollaboration = opportunityCollaborationData?.hub?.opportunity?.collaboration;
  const opportunityCollaborationPrivileges = opportunityCollaboration?.authorization?.myPrivileges;
  const canReadOpportunityCollaboration = opportunityCollaborationPrivileges?.includes(AuthorizationPrivilege.Read);

  const {
    data: opportunityAspectData,
    subscribeToMore: subscribeToOpportunity,
    loading: opportunityAspectDataLoading,
  } = useOpportunityCalloutAspectsSubscriptionQuery({
    variables: { hubNameId, calloutId, opportunityNameId: opportunityNameId! },
    skip: !canReadOpportunityCollaboration || !opportunityNameId || skip,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });

  const hubAspectSubscription = useCalloutAspectCreatedSubscription(
    hubAspectData,
    hubData => hubData?.hub?.collaboration?.callouts?.find(x => x.id === calloutId),
    subscribeToHub
  );
  const challengeAspectSubscription = useCalloutAspectCreatedSubscription(
    challengeAspectData,
    challengeData => challengeData?.hub?.challenge?.collaboration?.callouts?.find(x => x.id === calloutId),
    subscribeToChallenges
  );
  const opportunityAspectSubscription = useCalloutAspectCreatedSubscription(
    opportunityAspectData,
    opportunityData => opportunityData?.hub?.opportunity?.collaboration?.callouts?.find(x => x.id === calloutId),
    subscribeToOpportunity
  );

  const isSubscriptionEnabled =
    hubAspectSubscription.enabled || challengeAspectSubscription.enabled || opportunityAspectSubscription.enabled;

  const callout = (
    opportunityAspectData?.hub.opportunity ??
    challengeAspectData?.hub.challenge ??
    hubAspectData?.hub
  )?.collaboration?.callouts?.find(callout => callout.id === calloutId);

  return {
    aspects: callout?.aspects,
    loading: hubAspectDataLoading || challengeAspectDataLoading || opportunityAspectDataLoading,
    subscriptionEnabled: isSubscriptionEnabled,
  };
};
