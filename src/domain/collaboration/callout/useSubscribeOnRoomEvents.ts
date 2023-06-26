import { useApolloErrorHandler } from '../../../core/apollo/hooks/useApolloErrorHandler';
import { useConfig } from '../../platform/config/useConfig';
import { useUserContext } from '../../community/contributor/user';
import {
  MessageDetailsFragmentDoc,
  ReactionDetailsFragmentDoc,
  useRoomEventsSubscription,
} from '../../../core/apollo/generated/apollo-hooks';
import { FEATURE_SUBSCRIPTIONS } from '../../platform/config/features.constants';
import { MutationType } from '../../../core/apollo/generated/graphql-schema';
import { evictFromCache } from '../../shared/utils/apollo-cache/removeFromCache';

const useSubscribeOnRoomEvents = (roomID: string | undefined, skip?: boolean) => {
  const handleError = useApolloErrorHandler();
  const { isFeatureEnabled } = useConfig();
  const areSubscriptionsEnabled = isFeatureEnabled(FEATURE_SUBSCRIPTIONS);
  const { isAuthenticated } = useUserContext();

  const enabled = !!roomID && areSubscriptionsEnabled && isAuthenticated && !skip;

  useRoomEventsSubscription({
    shouldResubscribe: true,
    variables: { roomID: roomID! }, // Ensured by skip
    skip: !enabled,
    onSubscriptionData: ({ subscriptionData, client }) => {
      if (subscriptionData.error) {
        return handleError(subscriptionData.error);
      }

      const data = subscriptionData?.data;

      if (!data) {
        return;
      }

      const roomRefId = client.cache.identify({
        id: roomID,
        __typename: 'Room',
      });

      if (!roomRefId) {
        return;
      }

      const {
        roomEvents: { message, reaction },
      } = data;

      if (message) {
        const { data, type } = message;

        switch (type) {
          case MutationType.Create: {
            client.cache.modify({
              id: roomRefId,
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
          case MutationType.Delete: {
            const messageRefId = client.cache.identify({
              id: data.id,
              __typename: 'Message',
            });
            client.cache.modify({
              id: roomRefId,
              fields: {
                messages(existingMessages = []) {
                  return existingMessages.filter(message => message.__ref !== messageRefId);
                },
              },
            });
            evictFromCache(client.cache, data.id, 'Message');
            break;
          }
        }
      }
      if (reaction) {
        const { messageID, data, type } = reaction;
        switch (type) {
          case MutationType.Create: {
            const messageRefId = client.cache.identify({
              id: messageID,
              __typename: 'Message',
            });
            client.cache.modify({
              id: messageRefId,
              fields: {
                reactions(existingReactions = []) {
                  const newReactionRef = client.cache.writeFragment({
                    data,
                    fragment: ReactionDetailsFragmentDoc,
                    fragmentName: 'ReactionDetails',
                  });
                  return [...existingReactions, newReactionRef];
                },
              },
            });
            break;
          }
          case MutationType.Delete: {
            const reactionRefId = client.cache.identify({
              id: data.id,
              __typename: 'Reaction',
            });
            // Do not modify cache objects directly!
            // We only do this to find the parent messageId of this deleted reaction:
            const cacheObjects = client.cache.extract();
            const [messageRefId] = Object.keys(cacheObjects).filter(
              key =>
                cacheObjects[key].__typename === 'Message' &&
                cacheObjects[key].reactions?.some(reactionRef => reactionRef.__ref === reactionRefId)
            );
            if (messageRefId) {
              // Message found in cache, remove the reaction:
              client.cache.modify({
                id: messageRefId,
                fields: {
                  reactions(existingReactions = []) {
                    return existingReactions.filter(reaction => reaction.__ref !== reactionRefId);
                  },
                },
              });
            }
            break;
          }
        }
      }
    },
  });

  return enabled;
};

export default useSubscribeOnRoomEvents;
