import { FC, useMemo } from 'react';
import {
  CanvasDetailsFragmentDoc,
  useCheckoutCanvasOnContextMutation,
  useCreateCanvasOnContextMutation,
  useDeleteCanvasOnContextMutation,
  useUpdateCanvasOnContextMutation,
} from '../../hooks/generated/graphql';
import { ContainerProps } from '../../models/container';
import { CanvasWithoutValue } from '../../models/entities/canvas';
import {
  Canvas,
  CanvasCheckoutStateEnum,
  CreateCanvasOnContextInput,
  DeleteCanvasOnContextInput,
} from '../../models/graphql-schema';
import { evictFromCache } from '../../utils/apollo-cache/removeFromCache';

export interface ICanvasActions {
  onCreate: (canvas: CreateCanvasOnContextInput) => Promise<void>;
  onDelete: (canvas: DeleteCanvasOnContextInput) => Promise<void>;
  onCheckout: (canvas: CanvasWithoutValue) => void;
  onCheckin: (canvas: CanvasWithoutValue) => void;
  onUpdate: (canvas: Canvas) => void;
  onPromoteToTemplate: (canvas: Canvas) => void;
}

export interface CanvasActionsContainerState {
  creatingCanvas?: boolean;
  deletingCanvas?: boolean;
  changingCanvasLockState?: boolean;
  updatingCanvas?: boolean;
}

export interface CanvasActionsContainerProps extends ContainerProps<{}, ICanvasActions, CanvasActionsContainerState> {}

const CanvasActionsContainer: FC<CanvasActionsContainerProps> = ({ children }) => {
  const [createCanvas, { loading: creatingCanvas }] = useCreateCanvasOnContextMutation();

  const handleCreateCanvas = async (canvas: CreateCanvasOnContextInput) => {
    if (!canvas.contextID) {
      throw new Error('[canvas:onCreate]: Missing contextID');
    }

    await createCanvas({
      update(cache, { data }) {
        cache.modify({
          id: cache.identify({
            id: canvas.contextID,
            __typename: 'Context',
          }),
          fields: {
            canvases(existingCanvases = []) {
              if (data) {
                const newCanvas = cache.writeFragment({
                  data: data?.createCanvasOnContext,
                  fragment: CanvasDetailsFragmentDoc,
                  fragmentName: 'CanvasDetails',
                });
                return [...existingCanvases, newCanvas];
              }
              return existingCanvases;
            },
          },
        });
      },
      variables: {
        input: canvas,
      },
    });
  };

  const [deleteCanvas, { loading: deletingCanvas }] = useDeleteCanvasOnContextMutation();

  const handleDeleteCanvas = async (canvas: DeleteCanvasOnContextInput) => {
    if (!canvas.contextID) {
      throw new Error('[canvas:onDelete]: Missing contextID');
    }
    if (!canvas.canvasID) {
      throw new Error('[canvas:onDelete]: Missing canvasID');
    }

    await deleteCanvas({
      update: (cache, { data }) => {
        const output = data?.deleteCanvasOnContext;
        if (output) {
          evictFromCache(cache, String(output.id), 'Canvas');
        }
      },
      variables: {
        input: canvas,
      },
    });
  };

  const [checkoutCanvas, { loading: checkingoutCanvas }] = useCheckoutCanvasOnContextMutation();

  const handleCheckoutCanvas = async (canvas: CanvasWithoutValue) => {
    if (!canvas.checkout?.id) {
      throw new Error('[canvas:onCheckInOut]: Missing canvas.checkout.id');
    }

    await checkoutCanvas({
      update: (cache, { data }) => {
        cache.modify({
          id: cache.identify({
            id: canvas.id,
            __typename: 'Canvas',
          }),
          fields: {
            checkout(existingCheckout) {
              const output = data?.eventOnCanvasCheckout;
              if (output) {
                return output;
              }
              return existingCheckout;
            },
          },
        });
      },
      variables: {
        input: {
          canvasCheckoutID: canvas.checkout?.id,
          eventName:
            (canvas.checkout.status === CanvasCheckoutStateEnum.CheckedOut &&
              canvas.checkout?.lifecycle?.nextEvents?.find(e => e === 'CHECKIN')) ||
            'CHECKOUT',
        },
      },
    });
  };

  const [updateCanvas, { loading: updatingCanvas }] = useUpdateCanvasOnContextMutation();
  const handleUpdateCanvas = async (canvas: Canvas) => {
    if (!canvas.id) {
      throw new Error('[canvas:onUpdate]: Missing canvas.checkout.id');
    }

    await updateCanvas({
      variables: {
        input: {
          ID: canvas.id,
          name: canvas.name,
          isTemplate: canvas.isTemplate,
          value: canvas.value,
        },
      },
    });
  };

  const handlePromotionToTemplate = async (canvas: Canvas) => {
    if (!canvas.id) {
      throw new Error('[canvas:onUpdate]: Missing canvas.checkout.id');
    }

    await updateCanvas({
      variables: {
        input: {
          ID: canvas.id,
          isTemplate: true,
        },
      },
    });
  };

  const actions = useMemo<ICanvasActions>(
    () => ({
      onCreate: handleCreateCanvas,
      onDelete: handleDeleteCanvas,
      onCheckin: handleCheckoutCanvas,
      onCheckout: handleCheckoutCanvas,
      onUpdate: handleUpdateCanvas,
      onPromoteToTemplate: handlePromotionToTemplate,
    }),
    [handleCreateCanvas, handleDeleteCanvas, handleCheckoutCanvas, handleUpdateCanvas]
  );
  return (
    <>
      {children(
        {},
        {
          creatingCanvas,
          deletingCanvas,
          changingCanvasLockState: checkingoutCanvas,
          updatingCanvas,
        },
        actions
      )}
    </>
  );
};

export default CanvasActionsContainer;
