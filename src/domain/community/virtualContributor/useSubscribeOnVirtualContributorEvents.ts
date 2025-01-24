import { useVirtualContributorUpdatesSubscription } from '@/core/apollo/generated/apollo-hooks';
import { PlatformFeatureFlagName } from '@/core/apollo/generated/graphql-schema';
import { useConfig } from '@/domain/platform/config/useConfig';
import { useUserContext } from '../user';

export const useSubscribeOnVirtualContributorEvents = (virtualContributorId: string | undefined, skip?: boolean) => {
  const { isFeatureEnabled } = useConfig();
  const areSubscriptionsEnabled = isFeatureEnabled(PlatformFeatureFlagName.Subscriptions);
  const { isAuthenticated } = useUserContext();

  const enabled = !!virtualContributorId && areSubscriptionsEnabled && isAuthenticated && !skip;
  useVirtualContributorUpdatesSubscription({
    shouldResubscribe: true,
    variables: { virtualContributorID: virtualContributorId! }, // Ensured by skip
    skip: !enabled,
    onSubscriptionData: ({ subscriptionData, client }) => {
      const data = subscriptionData?.data;
      if (!data) {
        return;
      }

      const vcRefId = client.cache.identify({
        id: virtualContributorId,
        __typename: 'VirtualContributor',
      });

      const {
        virtualContributorUpdated: {
          virtualContributor: { id, status },
        },
      } = data;

      if (!vcRefId || id !== virtualContributorId) {
        return;
      }

      client.cache.modify({
        id: vcRefId,
        fields: {
          status() {
            return status;
          },
        },
      });
    },
  });
};
