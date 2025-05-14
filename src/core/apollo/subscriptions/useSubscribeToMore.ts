import { useEffect, useRef } from 'react';
import { useApolloErrorHandler } from '../hooks/useApolloErrorHandler';
import { useConfig } from '@/domain/platform/config/useConfig';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { ApolloError, OperationVariables, SubscribeToMoreOptions } from '@apollo/client';
import getDepsValueFromObject from '@/domain/shared/utils/getDepsValueFromObject';
import { PlatformFeatureFlagName } from '../generated/graphql-schema';
import type { SubscribeToMoreFunction } from '@apollo/client/core/watchQueryOptions';

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

    // @ts-ignore TS5UPGRADE
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
