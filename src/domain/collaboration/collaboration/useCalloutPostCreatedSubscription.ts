import { CalloutPostCreatedDocument } from '../../../core/apollo/generated/apollo-hooks';
import {
  PostsOnCalloutFragment,
  CalloutPostCreatedSubscription,
  CalloutPostCreatedSubscriptionVariables,
} from '../../../core/apollo/generated/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../../shared/subscriptions/useSubscriptionToSubEntity';

const useCalloutPostCreatedSubscription = createUseSubscriptionToSubEntityHook<
  PostsOnCalloutFragment,
  CalloutPostCreatedSubscription,
  CalloutPostCreatedSubscriptionVariables
>({
  subscriptionDocument: CalloutPostCreatedDocument,
  getSubscriptionVariables: callout => ({ calloutID: callout.id }),
  updateSubEntity: (callout, subscriptionData) => {
    callout?.posts?.push(subscriptionData.calloutPostCreated.post);
  },
});

export default useCalloutPostCreatedSubscription;
