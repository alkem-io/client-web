import { FC, useEffect, useMemo } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useUserContext } from '../../../community/contributor/user';
import {
  CanvasContentUpdatedDocument,
  useChallengeCanvasValuesQuery,
  useHubCanvasValuesQuery,
  useOpportunityCanvasValuesQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  Canvas,
  CanvasContentUpdatedSubscription,
  CanvasDetailsFragment,
  CanvasValueFragment,
  SubscriptionCanvasContentUpdatedArgs,
} from '../../../../core/apollo/generated/graphql-schema';
import { TemplateQuery } from './CanvasProvider';
import UseSubscriptionToSubEntity from '../../../shared/subscriptions/useSubscriptionToSubEntity';
import findById from '../../../shared/utils/findById';
import { getCanvasCalloutContainingCanvas } from './getCanvasCallout';

export interface ICanvasValueEntities {
  canvas?: CanvasValueFragment & CanvasDetailsFragment;
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
      canvasId: canvasId!,
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
      calloutId: calloutId!,
      canvasId: canvasId!,
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
      canvasId: canvasId!,
      calloutId: calloutId!,
    },
  });

  const canvas = useMemo(() => {
    const sourceArray =
      getCanvasCalloutContainingCanvas(hubData?.hub.collaboration?.callouts, canvasId!)?.canvases ||
      getCanvasCalloutContainingCanvas(challengeData?.hub.challenge.collaboration?.callouts, canvasId!)?.canvases ||
      getCanvasCalloutContainingCanvas(opportunityData?.hub.opportunity.collaboration?.callouts, canvasId!)?.canvases;

    return sourceArray?.find(c => c.id === canvasId) as Canvas | undefined;
  }, [hubData, challengeData, opportunityData, canvasId]);

  useEffect(() => {
    if (canvas) {
      onCanvasValueLoaded?.(canvas);
    }
  }, [canvas, onCanvasValueLoaded]);

  const skipCanvasSubscription = !canvasId || canvas?.checkout?.lockedBy === userId;

  useSubscribeToCanvas(
    hubData,
    data =>
      findById(getCanvasCalloutContainingCanvas(data?.hub.collaboration?.callouts, canvasId!)?.canvases, canvasId!),
    subHub,
    {
      skip: skipCanvasSubscription,
    }
  );

  useSubscribeToCanvas(
    challengeData,
    data =>
      findById(
        getCanvasCalloutContainingCanvas(data?.hub.challenge.collaboration?.callouts, canvasId!)?.canvases,
        canvasId!
      ),
    subChallenge,
    { skip: skipCanvasSubscription }
  );

  useSubscribeToCanvas(
    opportunityData,
    data =>
      findById(
        getCanvasCalloutContainingCanvas(data?.hub.opportunity.collaboration?.callouts, canvasId!)?.canvases,
        canvasId!
      ),
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
