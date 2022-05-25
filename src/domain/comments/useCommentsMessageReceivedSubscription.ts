import { CommentsMessageReceivedDocument } from '../../hooks/generated/graphql';
import {
  Comments,
  CommentsMessageReceivedSubscription,
  CommentsMessageReceivedSubscriptionVariables,
} from '../../models/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../shared/subscriptions/useSubscriptionToSubEntity';

const useCommentsMessageReceivedSubscription = createUseSubscriptionToSubEntityHook<
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
