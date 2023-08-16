import { ChallengeCreatedDocument } from '../../../../core/apollo/generated/apollo-hooks';
import {
  ChallengeCreatedSubscription,
  ChallengeCreatedSubscriptionVariables,
  ChallengesOnSpaceFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../../../../core/apollo/subscriptions/useSubscriptionToSubEntity';

const useChallengeCreatedSubscription = createUseSubscriptionToSubEntityHook<
  ChallengesOnSpaceFragment,
  ChallengeCreatedSubscription,
  ChallengeCreatedSubscriptionVariables
>({
  subscriptionDocument: ChallengeCreatedDocument,
  getSubscriptionVariables: space => ({ spaceID: space.id }),
  updateSubEntity: (space, subscriptionData) => {
    space?.challenges?.push(subscriptionData.challengeCreated.challenge);
  },
});

export default useChallengeCreatedSubscription;
