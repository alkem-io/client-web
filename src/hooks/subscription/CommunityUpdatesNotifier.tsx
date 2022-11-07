import { useApolloErrorHandler, useConfig, useNotification, useUserContext } from '..';
import { useCommunicationUpdateMessageReceivedSubscription } from '../generated/graphql';
import { FEATURE_COMMUNICATIONS, FEATURE_SUBSCRIPTIONS } from '../../models/constants';
import { logger } from '../../services/logging/winston/logger';

const useCommunityUpdatesNotifier = () => {
  const { isFeatureEnabled } = useConfig();
  const { isAuthenticated } = useUserContext();

  const shouldSkip =
    !isFeatureEnabled(FEATURE_COMMUNICATIONS) || !isFeatureEnabled(FEATURE_SUBSCRIPTIONS) || !isAuthenticated;

  try {
    useCommunityUpdatesSubscriber(shouldSkip);
  } catch (error) {
    logger.error('[Updates Notifier] Failed subscribing for community updates. Failing gracefully.');
  }
};

const useCommunityUpdatesSubscriber = (shouldSkip: boolean) => {
  const handleError = useApolloErrorHandler();
  const notify = useNotification();
  const { user: userMetadata } = useUserContext();
  const userId = userMetadata?.user.id;

  useCommunicationUpdateMessageReceivedSubscription({
    shouldResubscribe: true,
    skip: shouldSkip,
    onSubscriptionData: options => {
      if (options.subscriptionData.error) {
        handleError(options.subscriptionData.error);
        return;
      }

      const subData = options.subscriptionData.data?.communicationUpdateMessageReceived;
      if (!subData) return;

      const senderId = subData.message.sender.id;

      if (senderId === userId) {
        return;
      }

      notify('You just received an update');
    },
  });
};
export default useCommunityUpdatesNotifier;
