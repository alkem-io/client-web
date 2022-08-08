import { CalloutAspectCreatedDocument } from '../../hooks/generated/graphql';
import {
  AspectsOnCollaborationFragment,
  CalloutAspectCreatedSubscription,
  CalloutAspectCreatedSubscriptionVariables,
} from '../../models/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../shared/subscriptions/useSubscriptionToSubEntity';

const useContextAspectCreatedSubscription = createUseSubscriptionToSubEntityHook<
  AspectsOnCollaborationFragment,
  CalloutAspectCreatedSubscription,
  CalloutAspectCreatedSubscriptionVariables
>({
  subscriptionDocument: CalloutAspectCreatedDocument,
  getSubscriptionVariables: collaboration => ({ calloutID: collaboration?.callouts?.[0].id ?? '' }),
  updateSubEntity: (collaboration, subscriptionData) => {
    collaboration?.callouts?.[0]?.aspects?.push(subscriptionData.calloutAspectCreated.aspect);
  },
});

export default useContextAspectCreatedSubscription;
