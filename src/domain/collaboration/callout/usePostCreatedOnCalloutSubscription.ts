import {
  useChallengeCalloutPostsSubscriptionQuery,
  useHubCalloutPostsSubscriptionQuery,
  useOpportunityCalloutPostsSubscriptionQuery,
  usePrivilegesOnChallengeCollaborationQuery,
  usePrivilegesOnHubCollaborationQuery,
  usePrivilegesOnOpportunityCollaborationQuery,
} from '../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  ContributeTabPostFragment,
  Scalars,
} from '../../../core/apollo/generated/graphql-schema';
import useCalloutPostCreatedSubscription from '../collaboration/useCalloutPostCreatedSubscription';

export interface PostsData {
  subscriptionEnabled: boolean;
  posts: ContributeTabPostFragment[] | undefined;
  loading: boolean;
}

interface UsePostDataHookProps {
  hubNameId: Scalars['UUID_NAMEID'];
  calloutId: Scalars['UUID_NAMEID'];
  challengeNameId?: Scalars['UUID_NAMEID'];
  opportunityNameId?: Scalars['UUID_NAMEID'];
  skip?: boolean;
}

export const usePostCreatedOnCalloutSubscription = ({
  hubNameId,
  calloutId,
  challengeNameId = undefined,
  opportunityNameId = undefined,
  skip = false,
}: UsePostDataHookProps): PostsData => {
  const { data: hubCollaborationData } = usePrivilegesOnHubCollaborationQuery({
    variables: { hubNameId },
    skip: !!(challengeNameId || opportunityNameId),
  });
  const hubCollaboration = hubCollaborationData?.hub?.collaboration;
  const hubCollaborationPrivileges = hubCollaboration?.authorization?.myPrivileges;
  const canReadHubCollaboration = hubCollaborationPrivileges?.includes(AuthorizationPrivilege.Read);
  const {
    data: hubPostData,
    subscribeToMore: subscribeToHub,
    loading: hubPostDataLoading,
  } = useHubCalloutPostsSubscriptionQuery({
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
    data: challengePostData,
    subscribeToMore: subscribeToChallenges,
    loading: challengePostDataLoading,
  } = useChallengeCalloutPostsSubscriptionQuery({
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
    data: opportunityPostData,
    subscribeToMore: subscribeToOpportunity,
    loading: opportunityPostDataLoading,
  } = useOpportunityCalloutPostsSubscriptionQuery({
    variables: { hubNameId, calloutId, opportunityNameId: opportunityNameId! },
    skip: !canReadOpportunityCollaboration || !opportunityNameId || skip,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });

  const hubPostSubscription = useCalloutPostCreatedSubscription(
    hubPostData,
    hubData => hubData?.hub?.collaboration?.callouts?.find(x => x.id === calloutId),
    subscribeToHub
  );
  const challengePostSubscription = useCalloutPostCreatedSubscription(
    challengePostData,
    challengeData => challengeData?.hub?.challenge?.collaboration?.callouts?.find(x => x.id === calloutId),
    subscribeToChallenges
  );
  const opportunityPostSubscription = useCalloutPostCreatedSubscription(
    opportunityPostData,
    opportunityData => opportunityData?.hub?.opportunity?.collaboration?.callouts?.find(x => x.id === calloutId),
    subscribeToOpportunity
  );

  const isSubscriptionEnabled =
    hubPostSubscription.enabled || challengePostSubscription.enabled || opportunityPostSubscription.enabled;

  const callout = (
    opportunityPostData?.hub.opportunity ??
    challengePostData?.hub.challenge ??
    hubPostData?.hub
  )?.collaboration?.callouts?.find(callout => callout.id === calloutId);

  return {
    posts: callout?.posts,
    loading: hubPostDataLoading || challengePostDataLoading || opportunityPostDataLoading,
    subscriptionEnabled: isSubscriptionEnabled,
  };
};
