import { OpportunityCreatedDocument } from '../../../../core/apollo/generated/apollo-hooks';
import {
  OpportunitiesOnChallengeFragment,
  OpportunityCreatedSubscription,
  OpportunityCreatedSubscriptionVariables,
} from '../../../../core/apollo/generated/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../../../../core/apollo/subscriptions/useSubscriptionToSubEntity';

const useOpportunityCreatedSubscription = createUseSubscriptionToSubEntityHook<
  OpportunitiesOnChallengeFragment,
  OpportunityCreatedSubscription,
  OpportunityCreatedSubscriptionVariables
>({
  subscriptionDocument: OpportunityCreatedDocument,
  getSubscriptionVariables: challenge => ({ challengeID: challenge.id }),
  updateSubEntity: (challenge, subscriptionData) => {
    challenge?.opportunities?.push(subscriptionData.opportunityCreated.opportunity);
  },
});

export default useOpportunityCreatedSubscription;
