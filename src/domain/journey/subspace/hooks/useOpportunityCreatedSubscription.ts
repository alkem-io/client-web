import { SubspaceCreatedDocument } from '../../../../core/apollo/generated/apollo-hooks';
import {
  Space,
  SubspaceCreatedSubscription,
  SubspaceCreatedSubscriptionVariables,
  SubspacesOnSpaceFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../../../../core/apollo/subscriptions/useSubscriptionToSubEntity';

const useOpportunityCreatedSubscription = createUseSubscriptionToSubEntityHook<
  SubspacesOnSpaceFragment,
  SubspaceCreatedSubscription,
  SubspaceCreatedSubscriptionVariables
>({
  subscriptionDocument: SubspaceCreatedDocument,
  getSubscriptionVariables: challenge => ({ subspaceId: challenge.id }),
  updateSubEntity: (challenge, subscriptionData) => {
    challenge?.subspaces?.push(subscriptionData.subspaceCreated.subspace as Space);
  },
});

export default useOpportunityCreatedSubscription;
