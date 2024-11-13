import { SubspaceCreatedDocument } from '@core/apollo/generated/apollo-hooks';
import {
  SubspacesOnSpaceFragment,
  Space,
  SubspaceCreatedSubscription,
  SubspaceCreatedSubscriptionVariables,
} from '@core/apollo/generated/graphql-schema';
import createUseSubscriptionToSubEntityHook from '@core/apollo/subscriptions/useSubscriptionToSubEntity';

const useSubSpaceCreatedSubscription = createUseSubscriptionToSubEntityHook<
  SubspacesOnSpaceFragment,
  SubspaceCreatedSubscription,
  SubspaceCreatedSubscriptionVariables
>({
  subscriptionDocument: SubspaceCreatedDocument,
  getSubscriptionVariables: space => ({ subspaceId: space.id }),
  updateSubEntity: (space, subscriptionData) => {
    space?.subspaces?.push(subscriptionData.subspaceCreated.subspace as Space);
  },
});

export default useSubSpaceCreatedSubscription;
