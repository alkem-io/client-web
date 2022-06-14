import { useEffect } from 'react';
import { useApolloErrorHandler, useConfig, useUserContext } from '../../../hooks';
import { FEATURE_SUBSCRIPTIONS } from '../../../models/constants';
import { ApolloError, SubscribeToMoreOptions } from '@apollo/client';
import getEntriesSortedFlat from '../utils/getEntriesSortedFlat';

export interface SubscribeToMore<QueryData> {
  <SubscriptionData, SubscriptionVariables>(
    options: SubscribeToMoreOptions<QueryData, SubscriptionVariables, SubscriptionData>
  ): () => void;
}

export interface Options {
  skip?: boolean;
}

const useSubscribeToMore = <QueryData, SubscriptionData, SubscriptionVariables = undefined>(
  subscribeToMore: SubscribeToMore<QueryData>,
  options: SubscribeToMoreOptions<QueryData, SubscriptionVariables, SubscriptionData> & Options
) => {
  const handleError = useApolloErrorHandler();
  const { isFeatureEnabled } = useConfig();

  const areSubscriptionsEnabled = isFeatureEnabled(FEATURE_SUBSCRIPTIONS);

  const { isAuthenticated } = useUserContext();

  const { skip = false, ...subscribeToMoreOptions } = options;

  const isEnabled = areSubscriptionsEnabled && isAuthenticated && !skip;

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    return subscribeToMore({
      onError: err => handleError(new ApolloError({ errorMessage: err.message })),
      ...subscribeToMoreOptions,
    });
  }, [isEnabled, ...getEntriesSortedFlat((subscribeToMoreOptions.variables as {} | undefined) || {})]);

  return {
    enabled: isEnabled,
  };
};

export default useSubscribeToMore;
