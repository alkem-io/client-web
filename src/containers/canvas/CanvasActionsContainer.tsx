import { FC, useMemo } from 'react';
import { useApolloErrorHandler } from '../../hooks';
import {
  CanvasDetailsFragmentDoc,
  useCheckoutCanvasMutation,
  useCreateCanvasOnCalloutMutation,
  useDeleteCanvasMutation,
  useUpdateCanvasMutation,
  useUploadVisualMutation,
} from '../../hooks/generated/graphql';
import { ContainerChildProps } from '../../models/container';
import {
  Canvas,
  CanvasCheckoutStateEnum,
  CanvasDetailsFragment,
  CreateCanvasOnCalloutInput,
  DeleteCanvasInput,
} from '../../models/graphql-schema';
import { evictFromCache } from '../../domain/shared/utils/apollo-cache/removeFromCache';

export interface ICanvasActions {
  onCreate: (canvas: CreateCanvasOnCalloutInput) => Promise<void>;
  onDelete: (canvas: DeleteCanvasInput) => Promise<void>;
  onCheckout: (canvas: CanvasDetailsFragment) => Promise<void>;
  onCheckin: (canvas: CanvasDetailsFragment) => Promise<void>;
  onUpdate: (canvas: Canvas, previewImage?: Blob) => Promise<void>;
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
  const [createCanvas, { loading: creatingCanvas }] = useCreateCanvasOnCalloutMutation({
    onError: handleError,
  });

  const handleCreateCanvas = async (canvas: CreateCanvasOnCalloutInput) => {
    if (!canvas.calloutID) {
      throw new Error('[canvas:onCreate]: Missing contextID');
    }

    await createCanvas({
      update(cache, { data }) {
        cache.modify({
          id: cache.identify({
            id: canvas.calloutID,
            __typename: 'Callout',
          }),
          fields: {
            canvases(existingCanvases = []) {
              if (data) {
                const newCanvas = cache.writeFragment({
                  data: data?.createCanvasOnCallout,
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

  const [deleteCanvas, { loading: deletingCanvas }] = useDeleteCanvasMutation({
    onError: handleError,
  });

  const handleDeleteCanvas = async (canvas: DeleteCanvasInput) => {
    if (!canvas.ID) {
      throw new Error('[canvas:onDelete]: Missing canvas ID');
    }

    await deleteCanvas({
      update: (cache, { data }) => {
        const output = data?.deleteCanvas;
        if (output) {
          evictFromCache(cache, String(output.id), 'Canvas');
        }
      },
      variables: {
        input: canvas,
      },
    });
  };

  const [checkoutCanvas, { loading: checkingoutCanvas }] = useCheckoutCanvasMutation({
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

  const [updateCanvas, { loading: updatingCanvas }] = useUpdateCanvasMutation({
    onError: handleError,
  });

  const [uploadVisual, { loading: uploadingVisual }] = useUploadVisualMutation({
    onError: handleError,
  });

  const handleUpdateCanvas = async (canvas: Canvas, previewImage?: Blob) => {
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
      canvas.preview &&
        previewImage &&
        uploadVisual({
          variables: {
            file: new File([previewImage], `/Canvas-${canvas.nameID}-preview.png`, { type: 'image/png' }),
            uploadData: {
              visualID: canvas.preview?.id,
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
