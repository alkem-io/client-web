import { CalloutPostCreatedDocument } from '../../../../core/apollo/generated/apollo-hooks';
import {
  CalloutPostCreatedSubscription,
  CalloutPostCreatedSubscriptionVariables,
  CalloutPostsQuery,
} from '../../../../core/apollo/generated/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../../../../core/apollo/subscriptions/useSubscriptionToSubEntity';

const useCalloutPostCreatedSubscription = createUseSubscriptionToSubEntityHook<
  CalloutPostsQuery['lookup']['callout'],
  CalloutPostCreatedSubscription,
  CalloutPostCreatedSubscriptionVariables
>({
  subscriptionDocument: CalloutPostCreatedDocument,
  updateSubEntity: (callout, subscriptionData) => {
    callout?.contributions?.push({
      id: subscriptionData.calloutPostCreated.post.id, // THIS IS WRONG!! , Need to change the server so we return Contribution instead of Post
      sortOrder: 1,
      post: subscriptionData.calloutPostCreated.post,
    });
  },
});

export default useCalloutPostCreatedSubscription;
