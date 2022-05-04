import { CommentsDocument } from '../../hooks/generated/graphql';
import { Comments, CommentsSubscription, CommentsSubscriptionVariables } from '../../models/graphql-schema';
import createUseSubscriptionToSubEntity from '../shared/subscriptions/useSubscriptionToSubEntity';

const useComments = createUseSubscriptionToSubEntity<
  Omit<Comments, 'authorization'>,
  CommentsSubscriptionVariables,
  CommentsSubscription
>({
  subscriptionDocument: CommentsDocument,
  getSubscriptionVariables: comments => ({ commentsId: comments.id }),
  updateSubEntity: (comments, subscriptionData) => {
    comments?.messages?.push(subscriptionData.communicationCommentsMessageReceived.message);
  },
});

export default useComments;
