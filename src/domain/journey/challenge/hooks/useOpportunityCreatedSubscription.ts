import { SubspaceCreatedDocument } from '../../../../core/apollo/generated/apollo-hooks';
import {
  OpportunitiesOnChallengeFragment,
  Opportunity,
  SubspaceCreatedSubscription,
  SubspaceCreatedSubscriptionVariables,
} from '../../../../core/apollo/generated/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../../../../core/apollo/subscriptions/useSubscriptionToSubEntity';

const useOpportunityCreatedSubscription = createUseSubscriptionToSubEntityHook<
  OpportunitiesOnChallengeFragment,
  SubspaceCreatedSubscription,
  SubspaceCreatedSubscriptionVariables
>({
  subscriptionDocument: SubspaceCreatedDocument,
  getSubscriptionVariables: challenge => ({ journeyID: challenge.id }),
  updateSubEntity: (challenge, subscriptionData) => {
    challenge?.opportunities?.push(subscriptionData.subspaceCreated.childJourney as Opportunity);
  },
});

export default useOpportunityCreatedSubscription;
