import { FC, useEffect, useMemo } from 'react';
import { useUserContext } from '../../../community/contributor/user';
import {
  CanvasContentUpdatedDocument,
  useCanvasWithValueQuery,
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
import UseSubscriptionToSubEntity from '../../../shared/subscriptions/useSubscriptionToSubEntity';
import findById from '../../../shared/utils/findById';
import { getCanvasCalloutContainingCanvas } from './getCanvasCallout';
import { JourneyLocation } from '../../../../common/utils/urlBuilders';

export interface CanvasWithValue extends Omit<CanvasValueFragment, 'id'>, Partial<CanvasDetailsFragment> {}

export type CanvasWithoutValue<Canvas extends CanvasWithValue> = Omit<Canvas, 'value'>;

export interface ICanvasValueEntities {
  canvas?: CanvasWithValue;
}

export interface CanvasValueContainerState {
  loadingCanvasValue?: boolean;
}

export interface CanvasValueParams extends JourneyLocation {
  canvasId: string | undefined;
  calloutId: string | undefined;
}

export interface CanvasValueContainerProps
  extends ContainerChildProps<ICanvasValueEntities, {}, CanvasValueContainerState>,
    CanvasValueParams {
  onCanvasValueLoaded?: (canvas: CanvasWithValue) => void;
}

const useSubscribeToCanvas = UseSubscriptionToSubEntity<
  CanvasValueFragment & CanvasDetailsFragment,
  CanvasContentUpdatedSubscription,
  SubscriptionCanvasContentUpdatedArgs
>({
  subscriptionDocument: CanvasContentUpdatedDocument,
  getSubscriptionVariables: canvas => ({ canvasIDs: [canvas.id] }),
  updateSubEntity: (canvas, subscriptionData) => {
    if (canvas && subscriptionData.canvasContentUpdated.canvasID === canvas.id) {
      canvas.value = subscriptionData.canvasContentUpdated.value;
    }
  },
});

const CanvasValueContainer: FC<CanvasValueContainerProps> = ({
  children,
  canvasId,
  calloutId,
  hubNameId,
  challengeNameId,
  opportunityNameId,
  onCanvasValueLoaded,
}) => {
  const { user: userMetadata } = useUserContext();
  const userId = userMetadata?.user.id;

  const {
    data: canvasWithValueData,
    loading: loadingCanvasWithValue,
    subscribeToMore: subCanvasWithValue,
  } = useCanvasWithValueQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    variables: {
      canvasId: canvasId!,
    },
  });

  const canvas = canvasWithValueData?.canvas;

  // const skipHub = !Boolean(calloutId) || Boolean(challengeNameId) || Boolean(opportunityNameId) || !Boolean(canvasId);
  // const skipChallenge =
  //   !Boolean(calloutId) || Boolean(opportunityNameId) || !Boolean(challengeNameId) || !Boolean(canvasId);
  // const skipOpportunity = !Boolean(calloutId) || !Boolean(opportunityNameId) || !Boolean(canvasId);

  // const {
  //   data: challengeData,
  //   loading: loadingChallengeCanvasValue,
  //   subscribeToMore: subChallenge,
  // } = useChallengeCanvasValuesQuery({
  //   errorPolicy: 'all',
  //   fetchPolicy: 'network-only',
  //   nextFetchPolicy: 'cache-and-network',
  //   skip: skipChallenge,
  //   variables: {
  //     hubId: hubNameId!,
  //     challengeId: challengeNameId!,
  //     canvasId: canvasId!,
  //     calloutId: calloutId!,
  //   },
  // });

  // const {
  //   data: opportunityData,
  //   loading: loadingOpportunityCanvasValue,
  //   subscribeToMore: subOpportunity,
  // } = useOpportunityCanvasValuesQuery({
  //   errorPolicy: 'all',
  //   fetchPolicy: 'network-only',
  //   nextFetchPolicy: 'cache-and-network',
  //   skip: skipOpportunity,
  //   variables: {
  //     hubId: hubNameId!,
  //     opportunityId: opportunityNameId!,
  //     calloutId: calloutId!,
  //     canvasId: canvasId!,
  //   },
  // });

  // const {
  //   data: hubData,
  //   loading: loadingHubCanvasValue,
  //   subscribeToMore: subHub,
  // } = useHubCanvasValuesQuery({
  //   errorPolicy: 'all',
  //   fetchPolicy: 'network-only',
  //   nextFetchPolicy: 'cache-and-network',
  //   skip: skipHub,
  //   variables: {
  //     hubId: hubNameId!,
  //     canvasId: canvasId!,
  //     calloutId: calloutId!,
  //   },
  // });

  // const canvas = useMemo(() => {
  //   const sourceArray =
  //     getCanvasCalloutContainingCanvas(hubData?.hub.collaboration?.callouts, canvasId!)?.canvases ||
  //     getCanvasCalloutContainingCanvas(challengeData?.hub.challenge.collaboration?.callouts, canvasId!)?.canvases ||
  //     getCanvasCalloutContainingCanvas(opportunityData?.hub.opportunity.collaboration?.callouts, canvasId!)?.canvases;

  //   return sourceArray?.find(c => c.id === canvasId) as Canvas | undefined;
  // }, [hubData, challengeData, opportunityData, canvasId]);

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
          loadingCanvasValue: loadingCanvasWithValue,
        },
        {}
      )}
    </>
  );
};

export default CanvasValueContainer;
