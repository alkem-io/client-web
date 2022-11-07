import { useApolloErrorHandler, useConfig, useUserContext } from '../../../hooks';
import {
  MessageDetailsFragmentDoc,
  useCalloutMessageReceivedSubscription,
  useUserProfileOnCalloutMessageReceivedLazyQuery,
} from '../../../hooks/generated/graphql';
import { FEATURE_SUBSCRIPTIONS } from '../../../models/constants';
import { MessageDetailsFragment } from '../../../models/graphql-schema';

const useSubscribeOnCommentCallouts = (calloutIDs: string[], skip?: boolean) => {
  const handleError = useApolloErrorHandler();
  const { isFeatureEnabled } = useConfig();
  const areSubscriptionsEnabled = isFeatureEnabled(FEATURE_SUBSCRIPTIONS);
  const { isAuthenticated } = useUserContext();
  // todo: remove when issue with subscriptions is fixed
  // https://app.zenhub.com/workspaces/alkemio-development-5ecb98b262ebd9f4aec4194c/issues/alkem-io/server/2252
  const [getUserProfile] = useUserProfileOnCalloutMessageReceivedLazyQuery({
    onError: handleError,
  });

  const enabled = areSubscriptionsEnabled && isAuthenticated && calloutIDs.length > 0 && !skip;

  useCalloutMessageReceivedSubscription({
    shouldResubscribe: true,
    variables: { calloutIDs },
    skip: !enabled,
    onSubscriptionData: async ({ subscriptionData, client }) => {
      if (subscriptionData.error) {
        return handleError(subscriptionData.error);
      }

      const data = subscriptionData?.data;

      if (!data) {
        return;
      }

      const calloutCommentsCacheId = client.cache.identify({
        id: data.calloutMessageReceived.commentsID,
        __typename: 'Comments',
      });

      if (!calloutCommentsCacheId) {
        return;
      }

      const senderId = data.calloutMessageReceived.message.sender.id;
      const userProfileData = await getUserProfile({ variables: { userId: senderId } });
      const userProfile = userProfileData?.data?.user.profile;

      if (!userProfile) {
        return;
      }

      const newMessage: MessageDetailsFragment = {
        ...data.calloutMessageReceived.message,
        sender: {
          ...data.calloutMessageReceived.message.sender,
          profile: userProfile,
        },
      };

      client.cache.modify({
        id: calloutCommentsCacheId,
        fields: {
          messages(existingMessages = []) {
            const newMessageEntry = client.cache.writeFragment({
              data: newMessage,
              fragment: MessageDetailsFragmentDoc,
              fragmentName: 'MessageDetails',
            });
            return [...existingMessages, newMessageEntry];
          },
        },
      });
    },
  });

  return enabled;
};
export default useSubscribeOnCommentCallouts;
