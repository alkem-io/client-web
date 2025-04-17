import { useVirtualContributorUpdatesSubscription } from '@/core/apollo/generated/apollo-hooks';
import { PlatformFeatureFlagName } from '@/core/apollo/generated/graphql-schema';
import { useConfig } from '@/domain/platform/config/useConfig';
import { useCurrentUserContext } from '../user';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';

export const useSubscribeOnVirtualContributorEvents = (virtualContributorId: string | undefined, skip?: boolean) => {
  const { isFeatureEnabled } = useConfig();
  const handleError = useApolloErrorHandler();
  const areSubscriptionsEnabled = isFeatureEnabled(PlatformFeatureFlagName.Subscriptions);
  const { isAuthenticated } = useCurrentUserContext();

  const enabled = !!virtualContributorId && areSubscriptionsEnabled && isAuthenticated && !skip;
  useVirtualContributorUpdatesSubscription({
    shouldResubscribe: true,
    variables: { virtualContributorID: virtualContributorId! }, // Ensured by skip
    skip: !enabled,
    onData: ({ data: { data, error }, client }) => {
      if (error) {
        return handleError(error);
      }
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
