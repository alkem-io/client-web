import { useApolloErrorHandler, useConfig, useUserContext } from '../../hooks';
import { MessageDetailsFragmentDoc, useCalloutMessageReceivedSubscription } from '../../hooks/generated/graphql';
import { FEATURE_SUBSCRIPTIONS } from '../../models/constants';

const useSubscribeOnCommentCallouts = (calloutIDs: string[], skip?: boolean) => {
  const handleError = useApolloErrorHandler();
  const { isFeatureEnabled } = useConfig();
  const areSubscriptionsEnabled = isFeatureEnabled(FEATURE_SUBSCRIPTIONS);
  const { isAuthenticated } = useUserContext();

  const enabled = areSubscriptionsEnabled && isAuthenticated && calloutIDs.length > 0 && !skip;

  useCalloutMessageReceivedSubscription({
    shouldResubscribe: true,
    variables: { calloutIDs },
    skip: !enabled,
    onSubscriptionData: ({ subscriptionData, client }) => {
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

      client.cache.modify({
        id: calloutCommentsCacheId,
        fields: {
          messages(existingMessages = []) {
            const newMessage = client.cache.writeFragment({
              data: data.calloutMessageReceived.message,
              fragment: MessageDetailsFragmentDoc,
              fragmentName: 'MessageDetails',
            });
            return [...existingMessages, newMessage];
          },
        },
      });
    },
  });

  return enabled;
};
export default useSubscribeOnCommentCallouts;
