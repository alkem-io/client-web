import { ChallengeCreatedDocument } from '../../../../hooks/generated/graphql';
import {
  ChallengeCreatedSubscription,
  ChallengeCreatedSubscriptionVariables,
  ChallengesOnHubFragment,
} from '../../../../models/graphql-schema';
import createUseSubscriptionToSubEntityHook from '../../../shared/subscriptions/useSubscriptionToSubEntity';

const useChallengeCreatedSubscription = createUseSubscriptionToSubEntityHook<
  ChallengesOnHubFragment,
  ChallengeCreatedSubscription,
  ChallengeCreatedSubscriptionVariables
>({
  subscriptionDocument: ChallengeCreatedDocument,
  getSubscriptionVariables: hub => ({ hubID: hub.id }),
  updateSubEntity: (hub, subscriptionData) => {
    hub?.challenges?.push(subscriptionData.challengeCreated.challenge);
  },
});

export default useChallengeCreatedSubscription;
