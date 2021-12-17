import React from 'react';
import { useApolloErrorHandler, useGlobalState, useNotification } from '../../hooks';
import { useCommunicationDiscussionMessageReceivedSubscription } from '../../hooks/generated/graphql';
import { logger } from '../../services/logging/winston/logger';
import { ADD_COMMENT } from '../../state/global/entities/communityDiscussionMachine';

const DiscussionSubscriptionContainer = ({ children }) => {
  try {
    useDiscussionSubscription();
  } catch (error) {
    // need to find a way to capture globally all subscription failures
    logger.error('Failed subscribing for community discussions. Failing gracefully.');
  }

  return <>{children}</>;
};
export default DiscussionSubscriptionContainer;

const useDiscussionSubscription = () => {
  const handleError = useApolloErrorHandler();
  const {
    entities: { communityDiscussionService },
  } = useGlobalState();
  const notify = useNotification();

  return useCommunicationDiscussionMessageReceivedSubscription({
    shouldResubscribe: true,
    onSubscriptionData: options => {
      if (options.subscriptionData.error) {
        handleError(options.subscriptionData.error);
        return;
      }

      const subData = options.subscriptionData.data?.communicationDiscussionMessageReceived;
      if (!subData) return;

      communityDiscussionService.send({
        type: ADD_COMMENT,
        payload: subData,
      });

      console.log(ADD_COMMENT, subData);

      notify('You just received an message in a discussion');
    },
  });
};
