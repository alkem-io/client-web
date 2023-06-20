import { useApolloErrorHandler } from '../../../core/apollo/hooks/useApolloErrorHandler';
import { useConfig } from '../../platform/config/useConfig';
import { useUserContext } from '../../community/contributor/user';
import {
  MessageDetailsFragmentDoc,
  useRoomMessageReceivedSubscription,
} from '../../../core/apollo/generated/apollo-hooks';
import { FEATURE_SUBSCRIPTIONS } from '../../platform/config/features.constants';

const useSubscribeOnCommentCallout = (roomID: string, skip?: boolean) => {
  const handleError = useApolloErrorHandler();
  const { isFeatureEnabled } = useConfig();
  const areSubscriptionsEnabled = isFeatureEnabled(FEATURE_SUBSCRIPTIONS);
  const { isAuthenticated } = useUserContext();

  const enabled = areSubscriptionsEnabled && isAuthenticated && !skip;

  useRoomMessageReceivedSubscription({
    shouldResubscribe: true,
    variables: { roomID },
    skip: !enabled,
    onSubscriptionData: ({ subscriptionData, client }) => {
      if (subscriptionData.error) {
        return handleError(subscriptionData.error);
      }

      const data = subscriptionData?.data;

      if (!data) {
        return;
      }

      const cacheRoomId = client.cache.identify({
        id: data.roomMessageReceived.roomID,
        __typename: 'Room',
      });

      if (!cacheRoomId) {
        return;
      }

      client.cache.modify({
        id: cacheRoomId,
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

export default useSubscribeOnCommentCallout;
