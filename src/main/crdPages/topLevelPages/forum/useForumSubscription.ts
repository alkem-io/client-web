import { ForumDiscussionUpdatedDocument } from '@/core/apollo/generated/apollo-hooks';
import type {
  ForumDiscussionUpdatedSubscription,
  ForumDiscussionUpdatedSubscriptionVariables,
  PlatformDiscussionsQuery,
} from '@/core/apollo/generated/graphql-schema';
import createUseSubscriptionToSubEntityHook from '@/core/apollo/subscriptions/useSubscriptionToSubEntity';

export const useForumSubscription = createUseSubscriptionToSubEntityHook<
  PlatformDiscussionsQuery['platform']['forum'],
  ForumDiscussionUpdatedSubscription,
  ForumDiscussionUpdatedSubscriptionVariables
>({
  subscriptionDocument: ForumDiscussionUpdatedDocument,
  getSubscriptionVariables: forum => ({ forumID: forum.id }),
  updateSubEntity: (communication, subscriptionData) => {
    if (!communication?.discussions) {
      return;
    }
    const discussion = communication.discussions.find(d => d.id === subscriptionData.forumDiscussionUpdated.id);
    if (!discussion) {
      return;
    }
    Object.assign(discussion, subscriptionData.forumDiscussionUpdated);
  },
});
