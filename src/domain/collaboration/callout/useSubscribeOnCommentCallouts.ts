import { useApolloErrorHandler } from '../../../core/apollo/hooks/useApolloErrorHandler';
import { useConfig } from '../../platform/config/useConfig';
import { useUserContext } from '../../community/contributor/user';
import {
  MessageDetailsFragmentDoc,
  useRoomMessageReceivedSubscription,
} from '../../../core/apollo/generated/apollo-hooks';
import { FEATURE_SUBSCRIPTIONS } from '../../platform/config/features.constants';

const useSubscribeOnCommentCallouts = (calloutIDs: string[], skip?: boolean) => {
  const handleError = useApolloErrorHandler();
  const { isFeatureEnabled } = useConfig();
  const areSubscriptionsEnabled = isFeatureEnabled(FEATURE_SUBSCRIPTIONS);
  const { isAuthenticated } = useUserContext();

  const enabled = areSubscriptionsEnabled && isAuthenticated && calloutIDs.length > 0 && !skip;

  useRoomMessageReceivedSubscription({
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
        id: data.roomMessageReceived.roomID,
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
              data: data.roomMessageReceived.message,
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
