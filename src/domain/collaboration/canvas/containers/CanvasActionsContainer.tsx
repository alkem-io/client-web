import { FC, useCallback, useMemo } from 'react';
import {
  CanvasDetailsFragmentDoc,
  useCheckoutCanvasMutation,
  useCreateCanvasOnCalloutMutation,
  useDeleteCanvasMutation,
  useUpdateCanvasMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  CanvasDetailsFragment,
  CanvasValueFragment,
  CreateCanvasOnCalloutInput,
  DeleteCanvasInput,
} from '../../../../core/apollo/generated/graphql-schema';
import { evictFromCache } from '../../../shared/utils/apollo-cache/removeFromCache';
import { WhiteboardPreviewImage, useUploadWhiteboardVisuals } from '../WhiteboardPreviewImages/WhiteboardPreviewImages';

export interface ICanvasActions {
  onCreate: (canvas: CreateCanvasOnCalloutInput, previewImages?: WhiteboardPreviewImage[]) => Promise<void>;
  onDelete: (canvas: DeleteCanvasInput) => Promise<void>;
  onCheckout: (canvas: CanvasDetailsFragment) => Promise<void>;
  onCheckin: (canvas: CanvasDetailsFragment) => Promise<void>;
  onUpdate: (
    canvas: CanvasValueFragment & CanvasDetailsFragment,
    previewImages?: WhiteboardPreviewImage[]
  ) => Promise<void>;
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
  const [createCanvas, { loading: creatingCanvas }] = useCreateCanvasOnCalloutMutation({});
  const { uploadVisuals, loading: uploadingVisuals } = useUploadWhiteboardVisuals();

  const handleCreateCanvas = useCallback(
    async (canvas: CreateCanvasOnCalloutInput, previewImages?: WhiteboardPreviewImage[]) => {
      if (!canvas.calloutID) {
        throw new Error('[canvas:onCreate]: Missing contextID');
      }

      const result = await createCanvas({
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

      await uploadVisuals(
        previewImages,
        {
          cardVisualId: result.data?.createCanvasOnCallout.profile.visual?.id,
          previewVisualId: result.data?.createCanvasOnCallout.profile.preview?.id,
        },
        canvas.nameID
      );
    },
    [createCanvas]
  );

  const [deleteCanvas, { loading: deletingCanvas }] = useDeleteCanvasMutation({});

  const handleDeleteCanvas = useCallback(
    async (canvas: DeleteCanvasInput) => {
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
    },
    [deleteCanvas]
  );

  const [checkoutCanvas, { loading: checkingoutCanvas }] = useCheckoutCanvasMutation({});

  const LifecycleEventHandler = (eventName: 'CHECKIN' | 'CHECKOUT') => async (canvas: CanvasDetailsFragment) => {
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
          eventName,
          errorOnFailedTransition: false,
        },
      },
    });
  };

  const handleCheckin = useCallback(LifecycleEventHandler('CHECKIN'), [checkoutCanvas]);
  const handleCheckout = useCallback(LifecycleEventHandler('CHECKOUT'), [checkoutCanvas]);

  const [updateCanvas, { loading: updatingCanvas }] = useUpdateCanvasMutation({});

  const handleUpdateCanvas = useCallback(
    async (canvas: CanvasValueFragment & CanvasDetailsFragment, previewImages?: WhiteboardPreviewImage[]) => {
      await Promise.all([
        updateCanvas({
          variables: {
            input: {
              ID: canvas.id,
              value: canvas.value,
              profileData: {
                displayName: canvas.profile.displayName,
              },
            },
          },
        }),
        (canvas.profile.visual || canvas.profile.preview) &&
          previewImages &&
          uploadVisuals(
            previewImages,
            { cardVisualId: canvas.profile.visual?.id, previewVisualId: canvas.profile.preview?.id },
            canvas.nameID
          ),
      ]);
    },
    [updateCanvas, uploadVisuals]
  );

  const actions = useMemo<ICanvasActions>(
    () => ({
      onCreate: handleCreateCanvas,
      onDelete: handleDeleteCanvas,
      onCheckin: handleCheckin,
      onCheckout: handleCheckout,
      onUpdate: handleUpdateCanvas,
    }),
    [handleCreateCanvas, handleDeleteCanvas, handleCheckin, handleCheckout, handleUpdateCanvas]
  );

  return (
    <>
      {children(
        {},
        {
          creatingCanvas,
          deletingCanvas,
          changingCanvasLockState: checkingoutCanvas,
          updatingCanvas: updatingCanvas || uploadingVisuals,
        },
        actions
      )}
    </>
  );
};

export default CanvasActionsContainer;
