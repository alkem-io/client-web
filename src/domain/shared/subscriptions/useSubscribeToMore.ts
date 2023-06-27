import { useEffect, useRef } from 'react';
import { useApolloErrorHandler } from '../../../core/apollo/hooks/useApolloErrorHandler';
import { useConfig } from '../../platform/config/useConfig';
import { useUserContext } from '../../community/contributor/user';
import { FEATURE_SUBSCRIPTIONS } from '../../platform/config/features.constants';
import { ApolloError, SubscribeToMoreOptions } from '@apollo/client';
import getDepsValueFromObject from '../utils/getDepsValueFromObject';

export interface SubscribeToMore<QueryData> {
  <SubscriptionData, SubscriptionVariables>(
    options: SubscribeToMoreOptions<QueryData, SubscriptionVariables, SubscriptionData>
  ): () => void;
}

export interface Options<TVariables> {
  skip?: boolean;
  variables?: TVariables;
}

const useSubscribeToMore = <QueryData, SubscriptionData, SubscriptionVariables = undefined>(
  subscribeToMore: SubscribeToMore<QueryData>,
  options: SubscribeToMoreOptions<QueryData, SubscriptionVariables, SubscriptionData> & Options<SubscriptionVariables>
) => {
  const handleError = useRef(useApolloErrorHandler()).current;
  const { isFeatureEnabled } = useConfig();

  const areSubscriptionsEnabled = isFeatureEnabled(FEATURE_SUBSCRIPTIONS);

  const { isAuthenticated } = useUserContext();

  const { skip = false, ...subscribeToMoreOptions } = options;

  const isEnabled = areSubscriptionsEnabled && isAuthenticated && !skip;

  const getDepsValueFromObjectOptions = getDepsValueFromObject(subscribeToMoreOptions.variables);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    return subscribeToMore({
      onError: err => handleError(new ApolloError({ errorMessage: err.message })),
      ...subscribeToMoreOptions,
    });
  }, [isEnabled, getDepsValueFromObjectOptions, handleError, subscribeToMore]);

  return {
    enabled: isEnabled,
  };
};

export default useSubscribeToMore;
