import { CommentsMessageReceivedDocument } from '../../hooks/generated/graphql';
import {
  Comments,
  CommentsMessageReceivedSubscription,
  CommentsMessageReceivedSubscriptionVariables,
} from '../../models/graphql-schema';
import createUseSubscriptionToSubEntity from '../shared/subscriptions/useSubscriptionToSubEntity';

const useCommentsMessageReceivedSubscription = createUseSubscriptionToSubEntity<
  Omit<Comments, 'authorization'>,
  CommentsMessageReceivedSubscriptionVariables,
  CommentsMessageReceivedSubscription
>({
  subscriptionDocument: CommentsMessageReceivedDocument,
  getSubscriptionVariables: comments => ({ commentsId: comments.id }),
  updateSubEntity: (comments, subscriptionData) => {
    comments?.messages?.push(subscriptionData.communicationCommentsMessageReceived.message);
  },
});

export default useCommentsMessageReceivedSubscription;
