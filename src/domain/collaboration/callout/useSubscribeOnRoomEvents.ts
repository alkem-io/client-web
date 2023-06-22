import { useApolloErrorHandler } from '../../../core/apollo/hooks/useApolloErrorHandler';
import { useConfig } from '../../platform/config/useConfig';
import { useUserContext } from '../../community/contributor/user';
import { MessageDetailsFragmentDoc, useRoomEventsSubscription } from '../../../core/apollo/generated/apollo-hooks';
import { FEATURE_SUBSCRIPTIONS } from '../../platform/config/features.constants';
import { MutationType } from '../../../core/apollo/generated/graphql-schema';

const useSubscribeOnRoomEvents = (roomID: string, skip?: boolean) => {
  const handleError = useApolloErrorHandler();
  const { isFeatureEnabled } = useConfig();
  const areSubscriptionsEnabled = isFeatureEnabled(FEATURE_SUBSCRIPTIONS);
  const { isAuthenticated } = useUserContext();

  const enabled = areSubscriptionsEnabled && isAuthenticated && !skip;

  useRoomEventsSubscription({
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
        id: roomID,
        __typename: 'Room',
      });

      if (!cacheRoomId) {
        return;
      }

      // todo: handle reactions
      const {
        roomEvents: { message },
      } = data;

      if (message) {
        const { data, type } = message;

        switch (type) {
          case MutationType.Create: {
            client.cache.modify({
              id: cacheRoomId,
              fields: {
                messages(existingMessages = []) {
                  const newMessage = client.cache.writeFragment({
                    data,
                    fragment: MessageDetailsFragmentDoc,
                    fragmentName: 'MessageDetails',
                  });
                  return [...existingMessages, newMessage];
                },
              },
            });
            break;
          }
        }
      }
    },
  });

  return enabled;
};

export default useSubscribeOnRoomEvents;
