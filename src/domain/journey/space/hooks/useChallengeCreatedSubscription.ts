import { SubspaceCreatedDocument } from '../../../../core/apollo/generated/apollo-hooks';
import {
  Challenge,
  ChallengesOnSpaceFragment,
  SubspaceCreatedSubscription,
  SubspaceCreatedSubscriptionVariables,
} from '../../../../core/apollo/generated/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../../../../core/apollo/subscriptions/useSubscriptionToSubEntity';

const useChallengeCreatedSubscription = createUseSubscriptionToSubEntityHook<
  ChallengesOnSpaceFragment,
  SubspaceCreatedSubscription,
  SubspaceCreatedSubscriptionVariables
>({
  subscriptionDocument: SubspaceCreatedDocument,
  getSubscriptionVariables: space => ({ journeyID: space.id }),
  updateSubEntity: (space, subscriptionData) => {
    space?.challenges?.push(subscriptionData.subspaceCreated.childJourney as Challenge);
  },
});

export default useChallengeCreatedSubscription;
