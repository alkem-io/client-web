import { FC, useCallback, useMemo } from 'react';
import {
  WhiteboardDetailsFragmentDoc,
  refetchWhiteboardWithContentQuery,
  useCheckoutWhiteboardMutation,
  useCreateWhiteboardOnCalloutMutation,
  useDeleteWhiteboardMutation,
  useUpdateWhiteboardMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  WhiteboardDetailsFragment,
  WhiteboardContentFragment,
  CreateWhiteboardOnCalloutInput,
  DeleteWhiteboardInput,
} from '../../../../core/apollo/generated/graphql-schema';
import { evictFromCache } from '../../../../core/apollo/utils/removeFromCache';
import { WhiteboardPreviewImage, useUploadWhiteboardVisuals } from '../WhiteboardPreviewImages/WhiteboardPreviewImages';

export interface IWhiteboardActions {
  onCreate: (whiteboard: CreateWhiteboardOnCalloutInput, previewImages?: WhiteboardPreviewImage[]) => Promise<void>;
  onDelete: (whiteboard: DeleteWhiteboardInput) => Promise<void>;
  onCheckout: (whiteboard: WhiteboardDetailsFragment) => Promise<void>;
  onCheckin: (whiteboard: WhiteboardDetailsFragment) => Promise<void>;
  onUpdate: (
    whiteboard: WhiteboardContentFragment & WhiteboardDetailsFragment,
    previewImages?: WhiteboardPreviewImage[]
  ) => Promise<void>;
}

export interface WhiteboardActionsContainerState {
  creatingWhiteboard?: boolean;
  deletingWhiteboard?: boolean;
  changingWhiteboardLockState?: boolean;
  updatingWhiteboard?: boolean;
}

export interface WhiteboardActionsContainerProps
  extends ContainerChildProps<{}, IWhiteboardActions, WhiteboardActionsContainerState> {}

const WhiteboardActionsContainer: FC<WhiteboardActionsContainerProps> = ({ children }) => {
  const [createWhiteboard, { loading: creatingWhiteboard }] = useCreateWhiteboardOnCalloutMutation({});
  const { uploadVisuals, loading: uploadingVisuals } = useUploadWhiteboardVisuals();

  const handleCreateWhiteboard = useCallback(
    async (whiteboard: CreateWhiteboardOnCalloutInput, previewImages?: WhiteboardPreviewImage[]) => {
      if (!whiteboard.calloutID) {
        throw new Error('[whiteboard:onCreate]: Missing contextID');
      }

      const result = await createWhiteboard({
        update(cache, { data }) {
          cache.modify({
            id: cache.identify({
              id: whiteboard.calloutID,
              __typename: 'Callout',
            }),
            fields: {
              whiteboards(existingWhiteboards = []) {
                if (data) {
                  const newWhiteboard = cache.writeFragment({
                    data: data?.createWhiteboardOnCallout,
                    fragment: WhiteboardDetailsFragmentDoc,
                    fragmentName: 'WhiteboardDetails',
                  });
                  return [...existingWhiteboards, newWhiteboard];
                }
                return existingWhiteboards;
              },
            },
          });
        },
        variables: {
          input: whiteboard,
        },
      });

      uploadVisuals(
        previewImages,
        {
          cardVisualId: result.data?.createWhiteboardOnCallout.profile.visual?.id,
          previewVisualId: result.data?.createWhiteboardOnCallout.profile.preview?.id,
        },
        whiteboard.nameID
      );
    },
    [createWhiteboard]
  );

  const [deleteWhiteboard, { loading: deletingWhiteboard }] = useDeleteWhiteboardMutation({});

  const handleDeleteWhiteboard = useCallback(
    async (whiteboard: DeleteWhiteboardInput) => {
      if (!whiteboard.ID) {
        throw new Error('[whiteboard:onDelete]: Missing whiteboard ID');
      }

      await deleteWhiteboard({
        update: (cache, { data }) => {
          const output = data?.deleteWhiteboard;
          if (output) {
            evictFromCache(cache, String(output.id), 'Whiteboard');
          }
        },
        variables: {
          input: whiteboard,
        },
      });
    },
    [deleteWhiteboard]
  );

  const [checkoutWhiteboard, { loading: checkingoutWhiteboard }] = useCheckoutWhiteboardMutation({});

  const LifecycleEventHandler =
    (eventName: 'CHECKIN' | 'CHECKOUT') => async (whiteboard: WhiteboardDetailsFragment) => {
      if (!whiteboard.checkout?.id) {
        throw new Error('[whiteboard:onCheckInOut]: Missing whiteboard.checkout.id');
      }

      await checkoutWhiteboard({
        variables: {
          input: {
            whiteboardCheckoutID: whiteboard.checkout?.id,
            eventName,
            errorOnFailedTransition: false,
          },
        },
        refetchQueries: [
          refetchWhiteboardWithContentQuery({
            whiteboardId: whiteboard.id,
          }),
        ],
      });
    };

  const handleCheckin = useCallback(LifecycleEventHandler('CHECKIN'), [checkoutWhiteboard]);
  const handleCheckout = useCallback(LifecycleEventHandler('CHECKOUT'), [checkoutWhiteboard]);

  const [updateWhiteboard, { loading: updatingWhiteboard }] = useUpdateWhiteboardMutation({});

  const handleUpdateWhiteboard = useCallback(
    async (
      whiteboard: WhiteboardContentFragment & WhiteboardDetailsFragment,
      previewImages?: WhiteboardPreviewImage[]
    ) => {
      if ((whiteboard.profile.visual || whiteboard.profile.preview) && previewImages) {
        uploadVisuals(
          previewImages,
          { cardVisualId: whiteboard.profile.visual?.id, previewVisualId: whiteboard.profile.preview?.id },
          whiteboard.nameID
        );
      }
      await updateWhiteboard({
        variables: {
          input: {
            ID: whiteboard.id,
            content: whiteboard.content,
            profileData: {
              displayName: whiteboard.profile.displayName,
            },
          },
        },
      });
    },
    [updateWhiteboard, uploadVisuals]
  );

  const actions = useMemo<IWhiteboardActions>(
    () => ({
      onCreate: handleCreateWhiteboard,
      onDelete: handleDeleteWhiteboard,
      onCheckin: handleCheckin,
      onCheckout: handleCheckout,
      onUpdate: handleUpdateWhiteboard,
    }),
    [handleCreateWhiteboard, handleDeleteWhiteboard, handleCheckin, handleCheckout, handleUpdateWhiteboard]
  );

  return (
    <>
      {children(
        {},
        {
          creatingWhiteboard,
          deletingWhiteboard,
          changingWhiteboardLockState: checkingoutWhiteboard,
          updatingWhiteboard: updatingWhiteboard || uploadingVisuals,
        },
        actions
      )}
    </>
  );
};

export default WhiteboardActionsContainer;
