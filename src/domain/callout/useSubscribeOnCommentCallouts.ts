import { useEffect } from 'react';
import { useConfig, useUserContext } from '../../hooks';
import { useCalloutMessageReceivedSubscription } from '../../hooks/generated/graphql';
import { FEATURE_SUBSCRIPTIONS } from '../../models/constants';
import getDepsValueFromObject from '../shared/utils/getDepsValueFromObject';


const useSubscribeOnCommentCallouts = (calloutIDs: string[], skip?: boolean) => {
  const { isFeatureEnabled } = useConfig();
  const areSubscriptionsEnabled = isFeatureEnabled(FEATURE_SUBSCRIPTIONS);
  const { isAuthenticated } = useUserContext();

  const isEnabled = areSubscriptionsEnabled && isAuthenticated && !skip && calloutIDs.length;
  // todo not finished
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    useCalloutMessageReceivedSubscription({
      shouldResubscribe: true,
      variables: { calloutIDs },
      skip,
    })
  },
    [skip, isEnabled, getDepsValueFromObject(calloutIDs)]
  );

  return { enabled: isEnabled };
};
export default useSubscribeOnCommentCallouts;
