import {
  useChallengeCalloutPostsSubscriptionQuery,
  useSpaceCalloutPostsSubscriptionQuery,
  useOpportunityCalloutPostsSubscriptionQuery,
  usePrivilegesOnChallengeCollaborationQuery,
  usePrivilegesOnSpaceCollaborationQuery,
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
  spaceNameId: Scalars['UUID_NAMEID'];
  calloutId: Scalars['UUID_NAMEID'];
  challengeNameId?: Scalars['UUID_NAMEID'];
  opportunityNameId?: Scalars['UUID_NAMEID'];
  skip?: boolean;
}

export const usePostCreatedOnCalloutSubscription = ({
  spaceNameId,
  calloutId,
  challengeNameId = undefined,
  opportunityNameId = undefined,
  skip = false,
}: UsePostDataHookProps): PostsData => {
  const { data: spaceCollaborationData } = usePrivilegesOnSpaceCollaborationQuery({
    variables: { spaceNameId },
    skip: !!(challengeNameId || opportunityNameId),
  });
  const spaceCollaboration = spaceCollaborationData?.space?.collaboration;
  const spaceCollaborationPrivileges = spaceCollaboration?.authorization?.myPrivileges;
  const canReadSpaceCollaboration = spaceCollaborationPrivileges?.includes(AuthorizationPrivilege.Read);
  const {
    data: spacePostData,
    subscribeToMore: subscribeToSpace,
    loading: spacePostDataLoading,
  } = useSpaceCalloutPostsSubscriptionQuery({
    variables: { spaceNameId, calloutId },
    skip: !canReadSpaceCollaboration || !!(challengeNameId || opportunityNameId) || skip,
  });

  const { data: challengeCollaborationData } = usePrivilegesOnChallengeCollaborationQuery({
    variables: { spaceNameId, challengeNameId: challengeNameId! },
    skip: !challengeNameId || !!opportunityNameId,
  });
  const challengeCollaboration = challengeCollaborationData?.space?.challenge?.collaboration;
  const challengeCollaborationPrivileges = challengeCollaboration?.authorization?.myPrivileges;
  const canReadChallengeCollaboration = challengeCollaborationPrivileges?.includes(AuthorizationPrivilege.Read);

  const {
    data: challengePostData,
    subscribeToMore: subscribeToChallenges,
    loading: challengePostDataLoading,
  } = useChallengeCalloutPostsSubscriptionQuery({
    variables: { spaceNameId, calloutId, challengeNameId: challengeNameId! },
    skip: !canReadChallengeCollaboration || !challengeNameId || !!opportunityNameId || skip,
  });

  const { data: opportunityCollaborationData } = usePrivilegesOnOpportunityCollaborationQuery({
    variables: { spaceNameId, opportunityNameId: opportunityNameId! },
    skip: !opportunityNameId,
  });
  const opportunityCollaboration = opportunityCollaborationData?.space?.opportunity?.collaboration;
  const opportunityCollaborationPrivileges = opportunityCollaboration?.authorization?.myPrivileges;
  const canReadOpportunityCollaboration = opportunityCollaborationPrivileges?.includes(AuthorizationPrivilege.Read);

  const {
    data: opportunityPostData,
    subscribeToMore: subscribeToOpportunity,
    loading: opportunityPostDataLoading,
  } = useOpportunityCalloutPostsSubscriptionQuery({
    variables: { spaceNameId, calloutId, opportunityNameId: opportunityNameId! },
    skip: !canReadOpportunityCollaboration || !opportunityNameId || skip,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });

  const spacePostSubscription = useCalloutPostCreatedSubscription(
    spacePostData,
    spaceData => spaceData?.space?.collaboration?.callouts?.find(x => x.id === calloutId),
    subscribeToSpace
  );
  const challengePostSubscription = useCalloutPostCreatedSubscription(
    challengePostData,
    challengeData => challengeData?.space?.challenge?.collaboration?.callouts?.find(x => x.id === calloutId),
    subscribeToChallenges
  );
  const opportunityPostSubscription = useCalloutPostCreatedSubscription(
    opportunityPostData,
    opportunityData => opportunityData?.space?.opportunity?.collaboration?.callouts?.find(x => x.id === calloutId),
    subscribeToOpportunity
  );

  const isSubscriptionEnabled =
    spacePostSubscription.enabled || challengePostSubscription.enabled || opportunityPostSubscription.enabled;

  const callout = (
    opportunityPostData?.space.opportunity ??
    challengePostData?.space.challenge ??
    spacePostData?.space
  )?.collaboration?.callouts?.find(callout => callout.id === calloutId);

  return {
    posts: callout?.posts,
    loading: spacePostDataLoading || challengePostDataLoading || opportunityPostDataLoading,
    subscriptionEnabled: isSubscriptionEnabled,
  };
};
