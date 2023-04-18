import { FC, useCallback, useMemo } from 'react';
import {
  CanvasDetailsFragmentDoc,
  useCheckoutCanvasMutation,
  useCreateCanvasOnCalloutMutation,
  useDeleteCanvasMutation,
  useUpdateCanvasMutation,
  useUploadVisualMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  CanvasDetailsFragment,
  CanvasValueFragment,
  CreateCanvasOnCalloutInput,
  DeleteCanvasInput,
} from '../../../../core/apollo/generated/graphql-schema';
import { evictFromCache } from '../../../shared/utils/apollo-cache/removeFromCache';

export interface ICanvasActions {
  onCreate: (canvas: CreateCanvasOnCalloutInput) => Promise<void>;
  onDelete: (canvas: DeleteCanvasInput) => Promise<void>;
  onCheckout: (canvas: CanvasDetailsFragment) => Promise<void>;
  onCheckin: (canvas: CanvasDetailsFragment) => Promise<void>;
  onUpdate: (canvas: CanvasValueFragment & CanvasDetailsFragment, previewImage?: Blob) => Promise<void>;
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

  const handleCreateCanvas = useCallback(
    async (canvas: CreateCanvasOnCalloutInput) => {
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

  const [uploadVisual, { loading: uploadingVisual }] = useUploadVisualMutation({});

  const handleUpdateCanvas = useCallback(
    async (canvas: CanvasValueFragment & CanvasDetailsFragment, previewImage?: Blob) => {
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
        canvas.profile.visual &&
          previewImage &&
          uploadVisual({
            variables: {
              file: new File([previewImage], `/Canvas-${canvas.nameID}-preview.png`, { type: 'image/png' }),
              uploadData: {
                visualID: canvas.profile.visual?.id,
                alternativeText: '',
              },
            },
          }),
      ]);
    },
    [updateCanvas, uploadVisual]
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
          updatingCanvas: updatingCanvas || uploadingVisual,
        },
        actions
      )}
    </>
  );
};

export default CanvasActionsContainer;
