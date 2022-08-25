import { FC, useEffect, useMemo } from 'react';
import { useUrlParams, useUserContext } from '../../hooks';
import {
  CanvasContentUpdatedDocument,
  useChallengeCanvasValuesQuery,
  useHubCanvasValuesQuery,
  useOpportunityCanvasValuesQuery,
} from '../../hooks/generated/graphql';
import { ContainerChildProps } from '../../models/container';
import {
  Canvas,
  CanvasContentUpdatedSubscription,
  CanvasDetailsFragment,
  CanvasValueFragment,
  SubscriptionCanvasContentUpdatedArgs,
} from '../../models/graphql-schema';
import { TemplateQuery } from './CanvasProvider';
import UseSubscriptionToSubEntity from '../../domain/shared/subscriptions/useSubscriptionToSubEntity';
import findById from '../../domain/shared/utils/findById';
import { getCanvasCallout } from './getCanvasCallout';

export interface ICanvasValueEntities {
  canvas?: Canvas;
}

export interface CanvasValueContainerState {
  loadingCanvasValue?: boolean;
}

export interface CanvasValueParams {
  canvasId: string | undefined;
  calloutId: string | undefined;
  params?: TemplateQuery;
}

export interface CanvasValueContainerProps
  extends ContainerChildProps<ICanvasValueEntities, {}, CanvasValueContainerState>,
    CanvasValueParams {
  onCanvasValueLoaded?: (canvas: Canvas) => void;
}

const useSubscribeToCanvas = UseSubscriptionToSubEntity<
  CanvasValueFragment & CanvasDetailsFragment,
  CanvasContentUpdatedSubscription,
  SubscriptionCanvasContentUpdatedArgs
>({
  subscriptionDocument: CanvasContentUpdatedDocument,
  getSubscriptionVariables: canvas => ({ canvasIDs: [canvas.id] }),
  updateSubEntity: (canvas, subscriptionData) => {
    if (canvas) {
      canvas.value = subscriptionData.canvasContentUpdated.value;
    }
  },
});

const CanvasValueContainer: FC<CanvasValueContainerProps> = ({
  children,
  canvasId,
  calloutId,
  params,
  onCanvasValueLoaded,
}) => {
  const {
    hubNameId: hubId = '',
    challengeNameId: challengeId = '',
    opportunityNameId: opportunityId = '',
  } = useUrlParams();
  let queryOpportunityId: string | undefined = opportunityId;
  let queryChallengeId: string | undefined = challengeId;
  let queryHubId: string | undefined = hubId;

  const { user: userMetadata } = useUserContext();
  const userId = userMetadata?.user.id;

  if (params) {
    queryOpportunityId = params?.opportunityId;
    queryChallengeId = params?.challengeId;
    queryHubId = params?.hubId;
  }

  const skipHub = !Boolean(calloutId) || Boolean(queryChallengeId) || Boolean(queryOpportunityId) || !Boolean(canvasId);
  const skipChallenge =
    !Boolean(calloutId) || Boolean(queryOpportunityId) || !Boolean(queryChallengeId) || !Boolean(canvasId);
  const skipOpportunity = !Boolean(calloutId) || !Boolean(queryOpportunityId) || !Boolean(canvasId);

  const {
    data: challengeData,
    loading: loadingChallengeCanvasValue,
    subscribeToMore: subChallenge,
  } = useChallengeCanvasValuesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: skipChallenge,
    variables: {
      hubId: queryHubId,
      challengeId: queryChallengeId || '',
      canvasId: canvasId || '',
      calloutId: calloutId!,
    },
  });
  const {
    data: opportunityData,
    loading: loadingOpportunityCanvasValue,
    subscribeToMore: subOpportunity,
  } = useOpportunityCanvasValuesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: skipOpportunity,
    variables: {
      hubId: queryHubId,
      opportunityId: queryOpportunityId || '',
      canvasId: canvasId || '',
      calloutId: calloutId!,
    },
  });

  const {
    data: hubData,
    loading: loadingHubCanvasValue,
    subscribeToMore: subHub,
  } = useHubCanvasValuesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: skipHub,
    variables: {
      hubId: queryHubId,
      calloutId: calloutId!,
      canvasId: canvasId || '',
    },
  });

  const canvas = useMemo(() => {
    const sourceArray =
      getCanvasCallout(hubData?.hub.collaboration?.callouts, calloutId!)?.canvases ||
      getCanvasCallout(challengeData?.hub.challenge.collaboration?.callouts, calloutId!)?.canvases ||
      getCanvasCallout(opportunityData?.hub.opportunity.collaboration?.callouts, calloutId!)?.canvases;

    return sourceArray?.find(c => c.id === canvasId) as Canvas | undefined;
  }, [hubData, challengeData, opportunityData, canvasId]);

  useEffect(() => {
    if (canvas) {
      onCanvasValueLoaded?.(canvas);
    }
  }, [canvas]);

  const skipCanvasSubscription = !canvasId || canvas?.checkout?.lockedBy === userId;

  useSubscribeToCanvas(
    hubData,
    data => findById(getCanvasCallout(data?.hub.collaboration?.callouts, calloutId!)?.canvases, canvasId!),
    subHub,
    {
      skip: skipCanvasSubscription,
    }
  );

  useSubscribeToCanvas(
    challengeData,
    data => findById(getCanvasCallout(data?.hub.challenge.collaboration?.callouts, calloutId!)?.canvases, canvasId!),
    subChallenge,
    { skip: skipCanvasSubscription }
  );

  useSubscribeToCanvas(
    opportunityData,
    data => findById(getCanvasCallout(data?.hub.opportunity.collaboration?.callouts, calloutId!)?.canvases, canvasId!),
    subOpportunity,
    { skip: skipCanvasSubscription }
  );

  return (
    <>
      {children(
        {
          canvas,
        },
        {
          loadingCanvasValue: loadingHubCanvasValue || loadingChallengeCanvasValue || loadingOpportunityCanvasValue,
        },
        {}
      )}
    </>
  );
};

export default CanvasValueContainer;
