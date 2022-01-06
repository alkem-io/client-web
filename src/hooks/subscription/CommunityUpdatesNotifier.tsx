import { useApolloErrorHandler, useConfig, useNotification, useUserContext } from '../index';
import { useCommunicationUpdateMessageReceivedSubscription } from '../generated/graphql';
import { FEATURE_COMMUNICATIONS, FEATURE_SUBSCRIPTIONS } from '../../models/constants';
import { logger } from '../../services/logging/winston/logger';

const useCommunityUpdatesNotifier = () => {
  const { isFeatureEnabled } = useConfig();

  if (!isFeatureEnabled(FEATURE_COMMUNICATIONS) || !isFeatureEnabled(FEATURE_SUBSCRIPTIONS)) {
    return;
  }

  try {
    CommunityUpdatesSubscriber();
  } catch (error) {
    logger.error('[Updates Notifier] Failed subscribing for community updates. Failing gracefully.');
  }
};

const CommunityUpdatesSubscriber = () => {
  const handleError = useApolloErrorHandler();
  const notify = useNotification();
  const { user: userMetadata } = useUserContext();
  const userId = userMetadata?.user.id;

  useCommunicationUpdateMessageReceivedSubscription({
    shouldResubscribe: true,
    onSubscriptionData: options => {
      if (options.subscriptionData.error) {
        handleError(options.subscriptionData.error);
        return;
      }

      const subData = options.subscriptionData.data?.communicationUpdateMessageReceived;
      if (!subData) return;

      const senderId = subData.message.sender;

      if (senderId === userId) {
        return;
      }

      notify('You just received an update');
    },
  });
};
export default useCommunityUpdatesNotifier;
