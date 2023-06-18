import { FC, useEffect } from 'react';
import { useUserContext } from '../../../community/contributor/user';
import { CanvasContentUpdatedDocument, useCanvasWithValueQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  CanvasContentUpdatedSubscription,
  CanvasDetailsFragment,
  CanvasValueFragment,
  SubscriptionCanvasContentUpdatedArgs,
} from '../../../../core/apollo/generated/graphql-schema';
import UseSubscriptionToSubEntity from '../../../shared/subscriptions/useSubscriptionToSubEntity';

export interface CanvasWithValue extends Omit<CanvasValueFragment, 'id'>, Partial<CanvasDetailsFragment> {}

export type CanvasWithoutValue<Canvas extends CanvasWithValue> = Omit<Canvas, 'value'>;

export interface ICanvasValueEntities {
  canvas?: CanvasWithValue;
}

export interface CanvasValueContainerState {
  loadingCanvasValue?: boolean;
}

export interface CanvasValueParams {
  canvasId: string | undefined;
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

const CanvasValueContainer: FC<CanvasValueContainerProps> = ({ children, canvasId, onCanvasValueLoaded }) => {
  const { user: userMetadata } = useUserContext();
  const userId = userMetadata?.user.id;

  const skipCanvasQuery = !Boolean(canvasId);
  const {
    data: canvasWithValueData,
    loading: loadingCanvasWithValue,
    subscribeToMore: subscribeToCanvas,
  } = useCanvasWithValueQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-and-network',
    skip: skipCanvasQuery,
    variables: {
      canvasId: canvasId!,
    },
  });

  const canvas = canvasWithValueData?.canvas;

  useEffect(() => {
    if (canvas) {
      onCanvasValueLoaded?.(canvas);
    }
  }, [canvas, onCanvasValueLoaded]);

  const skipCanvasSubscription = !canvasId || canvas?.checkout?.lockedBy === userId;

  useSubscribeToCanvas(canvasWithValueData, data => data?.canvas, subscribeToCanvas, {
    skip: skipCanvasSubscription,
  });

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
