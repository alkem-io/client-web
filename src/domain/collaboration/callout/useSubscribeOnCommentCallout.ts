import { useApolloErrorHandler } from '../../../core/apollo/hooks/useApolloErrorHandler';
import { useConfig } from '../../platform/config/useConfig';
import { useUserContext } from '../../community/contributor/user';
import {
  MessageDetailsFragmentDoc,
  useRoomMessageReceivedSubscription,
} from '../../../core/apollo/generated/apollo-hooks';
import { FEATURE_SUBSCRIPTIONS } from '../../platform/config/features.constants';
import { gql } from '@apollo/client';

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

      console.log('data: ', data);

      if (!data) {
        return;
      }

      const calloutCommentsCacheId = client.cache.identify({
        id: data.roomMessageReceived.roomID,
        __typename: 'Comments',
      });

      console.log('calloutCommentsCacheId: ', calloutCommentsCacheId);

      if (!calloutCommentsCacheId) {
        return;
      }

      console.log(client.cache);

      const comments = client.readFragment({
        id: calloutCommentsCacheId,
        fragment: gql`
          fragment commentsFrag on Comments {
            id
          }
        `,
      });

      console.log(comments);

      const res = client.cache.modify({
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

      console.log(res);
    },
  });

  return enabled;
};

export default useSubscribeOnCommentCallout;
