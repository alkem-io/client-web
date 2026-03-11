import { ApolloError, type OperationVariables, type SubscribeToMoreOptions } from '@apollo/client';
import type { SubscribeToMoreFunction } from '@apollo/client/core/watchQueryOptions';
import { useEffect, useRef } from 'react';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useConfig } from '@/domain/platform/config/useConfig';
import getDepsValueFromObject from '@/domain/shared/utils/getDepsValueFromObject';
import { PlatformFeatureFlagName } from '../generated/graphql-schema';
import { useApolloErrorHandler } from '../hooks/useApolloErrorHandler';

export interface Options<TVariables> {
  skip?: boolean;
  variables?: TVariables;
}

const useSubscribeToMore = <QueryData, SubscriptionData, SubscriptionVariables extends OperationVariables>(
  subscribeToMore: SubscribeToMoreFunction<QueryData, SubscriptionVariables>,
  options: SubscribeToMoreOptions<QueryData, SubscriptionVariables, SubscriptionData> & Options<SubscriptionVariables>
) => {
  const handleError = useRef(useApolloErrorHandler()).current;
  const { isFeatureEnabled } = useConfig();

  const areSubscriptionsEnabled = isFeatureEnabled(PlatformFeatureFlagName.Subscriptions);

  const { isAuthenticated } = useCurrentUserContext();

  const { skip = false, ...subscribeToMoreOptions } = options;

  const isEnabled = areSubscriptionsEnabled && isAuthenticated && !skip;

  const getDepsValueFromObjectOptions = getDepsValueFromObject(subscribeToMoreOptions.variables || {});

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
