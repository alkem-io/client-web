import { useEffect, useRef } from 'react';
import { useApolloErrorHandler } from '../hooks/useApolloErrorHandler';
import { useConfig } from '../../../domain/platform/config/useConfig';
import { useUserContext } from '../../../domain/community/contributor/user';
import { FEATURE_SUBSCRIPTIONS } from '../../../domain/platform/config/features.constants';
import { ApolloError, SubscribeToMoreOptions } from '@apollo/client';
import getDepsValueFromObject from '../../../domain/shared/utils/getDepsValueFromObject';

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
