import {
  useChallengeCalloutAspectsSubscriptionQuery,
  useHubCalloutAspectsSubscriptionQuery,
  useOpportunityCalloutAspectsSubscriptionQuery,
  usePrivilegesOnChallengeCollaborationQuery,
  usePrivilegesOnHubCollaborationQuery,
  usePrivilegesOnOpportunityCollaborationQuery,
} from '../../../core/apollo/generated/apollo-hooks';
import { AspectCardFragment, AuthorizationPrivilege, Scalars } from '../../../core/apollo/generated/graphql-schema';
import useCalloutAspectCreatedSubscription from '../collaboration/useCalloutAspectCreatedSubscription';

export type AspectWithPermissions = AspectCardFragment & { canDelete: boolean | undefined };
export interface AspectsData {
  subscriptionEnabled: boolean;
}

interface UseAspectDataHookProps {
  hubNameId: Scalars['UUID_NAMEID'];
  calloutId: Scalars['UUID_NAMEID'];
  challengeNameId?: Scalars['UUID_NAMEID'];
  opportunityNameId?: Scalars['UUID_NAMEID'];
}

export const useAspectCreatedOnCalloutSubscription = ({
  hubNameId,
  calloutId,
  challengeNameId = undefined,
  opportunityNameId = undefined,
}: UseAspectDataHookProps): AspectsData => {
  const { data: hubCollaborationData } = usePrivilegesOnHubCollaborationQuery({
    variables: { hubNameId },
    skip: !!(challengeNameId || opportunityNameId),
  });
  const hubCollaboration = hubCollaborationData?.hub?.collaboration;
  const hubCollaborationPrivileges = hubCollaboration?.authorization?.myPrivileges;
  const canReadHubCollaboration = hubCollaborationPrivileges?.includes(AuthorizationPrivilege.Read);
  const { data: hubAspectData, subscribeToMore: subscribeToHub } = useHubCalloutAspectsSubscriptionQuery({
    variables: { hubNameId, calloutId },
    skip: !canReadHubCollaboration || !!(challengeNameId || opportunityNameId),
  });

  const { data: challengeCollaborationData } = usePrivilegesOnChallengeCollaborationQuery({
    variables: { hubNameId, challengeNameId: challengeNameId! },
    skip: !challengeNameId || !!opportunityNameId,
  });
  const challengeCollaboration = challengeCollaborationData?.hub?.challenge?.collaboration;
  const challengeCollaborationPrivileges = challengeCollaboration?.authorization?.myPrivileges;
  const canReadChallengeCollaboration = challengeCollaborationPrivileges?.includes(AuthorizationPrivilege.Read);

  const { data: challengeAspectData, subscribeToMore: subscribeToChallenges } =
    useChallengeCalloutAspectsSubscriptionQuery({
      variables: { hubNameId, calloutId, challengeNameId: challengeNameId! },
      skip: !canReadChallengeCollaboration || !challengeNameId || !!opportunityNameId,
    });

  const { data: opportunityCollaborationData } = usePrivilegesOnOpportunityCollaborationQuery({
    variables: { hubNameId, opportunityNameId: opportunityNameId! },
    skip: !opportunityNameId,
  });
  const opportunityCollaboration = opportunityCollaborationData?.hub?.opportunity?.collaboration;
  const opportunityCollaborationPrivileges = opportunityCollaboration?.authorization?.myPrivileges;
  const canReadOpportunityCollaboration = opportunityCollaborationPrivileges?.includes(AuthorizationPrivilege.Read);

  const { data: opportunityAspectData, subscribeToMore: subscribeToOpportunity } =
    useOpportunityCalloutAspectsSubscriptionQuery({
      variables: { hubNameId, calloutId, opportunityNameId: opportunityNameId! },
      skip: !canReadOpportunityCollaboration || !opportunityNameId,
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

  return {
    subscriptionEnabled: isSubscriptionEnabled,
  };
};
