import { CalloutPostCreatedDocument } from '@/core/apollo/generated/apollo-hooks';
import {
  CalloutPostCreatedSubscription,
  CalloutPostCreatedSubscriptionVariables,
  CalloutContributionsQuery,
} from '@/core/apollo/generated/graphql-schema';
import createUseSubscriptionToSubEntityHook from '@/core/apollo/subscriptions/useSubscriptionToSubEntity';

const useCalloutPostCreatedSubscription = createUseSubscriptionToSubEntityHook<
  CalloutContributionsQuery['lookup']['callout'],
  CalloutPostCreatedSubscription,
  CalloutPostCreatedSubscriptionVariables
>({
  subscriptionDocument: CalloutPostCreatedDocument,
  updateSubEntity: (callout, subscriptionData) => {
    callout?.contributions?.push({
      id: subscriptionData.calloutPostCreated.contributionID,
      sortOrder: subscriptionData.calloutPostCreated.sortOrder,
      post: subscriptionData.calloutPostCreated.post,
    });
  },
});

export default useCalloutPostCreatedSubscription;
