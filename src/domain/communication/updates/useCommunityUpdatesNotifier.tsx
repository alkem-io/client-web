import { useConfig } from '../../platform/config/useConfig';
import { useUserContext } from '../../community/user';
import { useApolloErrorHandler } from '../../../core/apollo/hooks/useApolloErrorHandler';
import { useNotification } from '../../../core/ui/notifications/useNotification';
import { usePlatformUpdatesRoomQuery, useRoomEventsSubscription } from '../../../core/apollo/generated/apollo-hooks';
import { MutationType, PlatformFeatureFlagName } from '../../../core/apollo/generated/graphql-schema';

const useCommunityUpdatesNotifier = () => {
  const { isFeatureEnabled } = useConfig();
  const { isAuthenticated } = useUserContext();

  const { data } = usePlatformUpdatesRoomQuery();
  const roomID = data?.platform?.communication?.updates?.id;

  const shouldSkip =
    !isFeatureEnabled(PlatformFeatureFlagName.Communications) ||
    !isFeatureEnabled(PlatformFeatureFlagName.Subscriptions) ||
    !isAuthenticated ||
    !roomID;

  try {
    useCommunityUpdatesSubscriber(roomID!, shouldSkip);
  } catch (error) {
    console.error('[Updates Notifier] Failed subscribing for community updates. Failing gracefully.');
  }
};

const useCommunityUpdatesSubscriber = (roomID: string, shouldSkip: boolean) => {
  const handleError = useApolloErrorHandler();
  const notify = useNotification();
  const { user: userMetadata } = useUserContext();
  const userId = userMetadata?.user.id;

  useRoomEventsSubscription({
    shouldResubscribe: true,
    skip: shouldSkip,
    variables: { roomID },
    onSubscriptionData: options => {
      if (options.subscriptionData.error) {
        handleError(options.subscriptionData.error);
        return;
      }

      const subData = options.subscriptionData.data?.roomEvents;
      if (!subData) return;

      const { message } = subData;

      if (message && message.type === MutationType.Create) {
        const senderId = message.data.sender?.id;

        if (senderId === userId) {
          return;
        }

        notify('You just received an update');
      }
    },
  });
};

export default useCommunityUpdatesNotifier;
