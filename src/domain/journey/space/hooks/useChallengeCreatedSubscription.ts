import { SubspaceCreatedDocument } from '../../../../core/apollo/generated/apollo-hooks';
import {
  SubspacesOnSpaceFragment,
  Space,
  SubspaceCreatedSubscription,
  SubspaceCreatedSubscriptionVariables,
} from '../../../../core/apollo/generated/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../../../../core/apollo/subscriptions/useSubscriptionToSubEntity';

const useChallengeCreatedSubscription = createUseSubscriptionToSubEntityHook<
  SubspacesOnSpaceFragment,
  SubspaceCreatedSubscription,
  SubspaceCreatedSubscriptionVariables
>({
  subscriptionDocument: SubspaceCreatedDocument,
  getSubscriptionVariables: space => ({ journeyID: space.id }),
  updateSubEntity: (space, subscriptionData) => {
    space?.subspaces?.push(subscriptionData.subspaceCreated.childJourney as Space);
  },
});

export default useChallengeCreatedSubscription;
