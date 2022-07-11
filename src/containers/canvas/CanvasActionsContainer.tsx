import { FC, useMemo } from 'react';
import { useApolloErrorHandler } from '../../hooks';
import {
  CanvasDetailsFragmentDoc,
  useCheckoutCanvasOnContextMutation,
  useCreateCanvasOnContextMutation,
  useDeleteCanvasOnContextMutation,
  useUpdateCanvasOnContextMutation,
  useUploadVisualMutation,
} from '../../hooks/generated/graphql';
import { ContainerChildProps } from '../../models/container';
import {
  Canvas,
  CanvasCheckoutStateEnum,
  CanvasDetailsFragment,
  CreateCanvasOnContextInput,
  DeleteCanvasOnContextInput,
} from '../../models/graphql-schema';
import { evictFromCache } from '../../domain/shared/utils/apollo-cache/removeFromCache';

export interface ICanvasActions {
  onCreate: (canvas: CreateCanvasOnContextInput) => Promise<void>;
  onDelete: (canvas: DeleteCanvasOnContextInput) => Promise<void>;
  onCheckout: (canvas: CanvasDetailsFragment) => Promise<void>;
  onCheckin: (canvas: CanvasDetailsFragment) => Promise<void>;
  onUpdate: (canvas: Canvas, bannerCardBitmap?: Blob) => Promise<void>;
}

export interface CanvasActionsContainerState {
  creatingCanvas?: boolean;
  deletingCanvas?: boolean;
  changingCanvasLockState?: boolean;
  updatingCanvas?: boolean;
}

export interface CanvasActionsContainerProps
  extends ContainerChildProps<{}, ICanvasActions, CanvasActionsContainerState> {}

const CanvasActionsContainer: FC<CanvasActionsContainerProps> = ({ children }) => {
  const handleError = useApolloErrorHandler();
  const [createCanvas, { loading: creatingCanvas }] = useCreateCanvasOnContextMutation({
    onError: handleError,
  });

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

  const [deleteCanvas, { loading: deletingCanvas }] = useDeleteCanvasOnContextMutation({
    onError: handleError,
  });

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

  const [checkoutCanvas, { loading: checkingoutCanvas }] = useCheckoutCanvasOnContextMutation({
    onError: handleError,
  });

  const handleCheckoutCanvas = async (canvas: CanvasDetailsFragment) => {
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

  const [updateCanvas, { loading: updatingCanvas }] = useUpdateCanvasOnContextMutation({
    onError: handleError,
  });

  const [uploadVisual, { loading: uploadingVisual }] = useUploadVisualMutation({
    onError: handleError,
  });

  const handleUpdateCanvas = async (canvas: Canvas, bannerCardBitmap?: Blob) => {
    await Promise.all([
      updateCanvas({
        variables: {
          input: {
            ID: canvas.id,
            displayName: canvas.displayName,
            value: canvas.value,
          },
        },
      }),
      canvas.bannerCard &&
        bannerCardBitmap &&
        uploadVisual({
          variables: {
            file: new File([bannerCardBitmap], `/Canvas-${canvas.nameID}-bannerCard.png`, { type: 'image/png' }),
            uploadData: {
              visualID: canvas.bannerCard?.id,
            },
          },
        }),
    ]);
  };

  const actions = useMemo<ICanvasActions>(
    () => ({
      onCreate: handleCreateCanvas,
      onDelete: handleDeleteCanvas,
      onCheckin: handleCheckoutCanvas,
      onCheckout: handleCheckoutCanvas,
      onUpdate: handleUpdateCanvas,
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
          updatingCanvas: updatingCanvas || uploadingVisual,
        },
        actions
      )}
    </>
  );
};

export default CanvasActionsContainer;
