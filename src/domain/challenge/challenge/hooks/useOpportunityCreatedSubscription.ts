import { OpportunityCreatedDocument } from '../../../../hooks/generated/graphql';
import {
  OpportunitiesOnChallengeFragment,
  OpportunityCreatedSubscription,
  OpportunityCreatedSubscriptionVariables,
} from '../../../../models/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../../../shared/subscriptions/useSubscriptionToSubEntity';

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
