import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import { useConfig } from '@/domain/platform/config/useConfig';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import {
  VcInteractionsDetailsFragmentDoc,
  MessageDetailsFragmentDoc,
  ReactionDetailsFragmentDoc,
  useRoomEventsSubscription,
} from '@/core/apollo/generated/apollo-hooks';
import { MutationType, PlatformFeatureFlagName } from '@/core/apollo/generated/graphql-schema';
import { evictFromCache } from '@/core/apollo/utils/removeFromCache';

const useSubscribeOnRoomEvents = (roomID: string | undefined, skip?: boolean) => {
  const handleError = useApolloErrorHandler();
  const { isFeatureEnabled } = useConfig();
  const areSubscriptionsEnabled = isFeatureEnabled(PlatformFeatureFlagName.Subscriptions);
  const { isAuthenticated } = useCurrentUserContext();

  const enabled = !!roomID && areSubscriptionsEnabled && isAuthenticated && !skip;

  useRoomEventsSubscription({
    shouldResubscribe: true,
    variables: { roomID: roomID! }, // Ensured by skip
    skip: !enabled,
    onData: ({ data: { data, error }, client }) => {
      if (error) {
        return handleError(error);
      }

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
        roomEvents: {
          message,
          reaction,
          room: { vcInteractions },
        },
      } = data;

      if (message) {
        const { data, type } = message;
        const messageRefId = client.cache.identify({
          id: data.id,
          __typename: 'Message',
        });

        switch (type) {
          case MutationType.Create: {
            // Write the message to cache (or update if exists)
            const newMessageRef = client.cache.writeFragment({
              data,
              fragment: MessageDetailsFragmentDoc,
              fragmentName: 'MessageDetails',
            });

            client.cache.modify({
              id: roomRefId,
              fields: {
                messages(existingMessages = []) {
                  // Check if already in the Room's messages array
                  if (existingMessages.some(m => m.__ref === messageRefId)) {
                    return existingMessages;
                  }
                  return [...existingMessages, newMessageRef];
                },
                vcInteractions(existingInteractions = []) {
                  return [
                    ...existingInteractions,
                    ...vcInteractions.map(data =>
                      client.cache.writeFragment({
                        data,
                        fragment: VcInteractionsDetailsFragmentDoc,
                        fragmentName: 'VcInteractionsDetails',
                      })
                    ),
                  ];
                },
              },
            });
            break;
          }
          case MutationType.Delete: {
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
        const reactionRefId = client.cache.identify({
          id: data.id,
          __typename: 'Reaction',
        });

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
                  if (existingReactions.some(r => r.__ref === reactionRefId)) {
                    return existingReactions;
                  }
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
