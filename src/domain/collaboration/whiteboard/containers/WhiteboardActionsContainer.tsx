import { PropsWithChildren, useCallback, useMemo } from 'react';
import {
  WhiteboardDetailsFragmentDoc,
  useCreateWhiteboardOnCalloutMutation,
  useDeleteWhiteboardMutation,
  useUpdateWhiteboardMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '@/core/container/container';
import { CreateContributionOnCalloutInput } from '@/core/apollo/generated/graphql-schema';
import { evictFromCache } from '@/core/apollo/utils/removeFromCache';
import { WhiteboardPreviewImage, useUploadWhiteboardVisuals } from '../WhiteboardPreviewImages/WhiteboardPreviewImages';
import { Identifiable } from '@/core/utils/Identifiable';

interface WhiteboardWithPreviewVisuals {
  nameID: string; // Whiteboard nameID is used to name the files uploaded as visuals
  profile: {
    visual?: {
      id: string;
    };
    preview?: {
      id: string;
    };
  };
}

export interface IWhiteboardActions {
  onCreate: (
    whiteboard: CreateContributionOnCalloutInput,
    previewImages?: WhiteboardPreviewImage[]
  ) => Promise<{ success: boolean; errors?: string[] }>;
  onDelete: (whiteboard: Identifiable) => Promise<void>;

  onUpdate: (
    whiteboard: WhiteboardWithPreviewVisuals,
    previewImages?: WhiteboardPreviewImage[]
  ) => Promise<{ success: boolean; errors?: string[] }>;

  onChangeDisplayName: (whiteboardId: string | undefined, displayName: string) => Promise<void>;
}

export interface WhiteboardActionsContainerState {
  creatingWhiteboard?: boolean;
  deletingWhiteboard?: boolean;
  changingWhiteboardLockState?: boolean;
  updatingWhiteboard?: boolean;
  uploadingVisuals?: boolean;
}

export interface WhiteboardActionsContainerProps
  extends ContainerChildProps<{}, IWhiteboardActions, WhiteboardActionsContainerState> {}

const WhiteboardActionsContainer = ({ children }: PropsWithChildren<WhiteboardActionsContainerProps>) => {
  const [createWhiteboard, { loading: creatingWhiteboard }] = useCreateWhiteboardOnCalloutMutation({});
  const { uploadVisuals, loading: uploadingVisuals } = useUploadWhiteboardVisuals();

  const handleCreateWhiteboard = useCallback(
    async (whiteboardContribution: CreateContributionOnCalloutInput, previewImages?: WhiteboardPreviewImage[]) => {
      if (!whiteboardContribution.calloutID) {
        throw new Error('[whiteboard:onCreate]: Missing contextID');
      }

      const result = await createWhiteboard({
        update(cache, { data }) {
          cache.modify({
            id: cache.identify({
              id: whiteboardContribution.calloutID,
              __typename: 'Callout',
            }),
            fields: {
              whiteboards(existingWhiteboards = []) {
                if (data) {
                  const newWhiteboard = cache.writeFragment({
                    data: data?.createContributionOnCallout.whiteboard,
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
          input: whiteboardContribution,
        },
      });

      uploadVisuals(
        previewImages,
        {
          cardVisualId: result.data?.createContributionOnCallout.whiteboard?.profile.visual?.id,
          previewVisualId: result.data?.createContributionOnCallout.whiteboard?.profile.preview?.id,
        },
        result.data?.createContributionOnCallout.whiteboard?.nameID
      );
      return {
        success: !result.errors || result.errors.length === 0,
        errors: result.errors?.map(({ message }) => message),
      };
    },
    [createWhiteboard]
  );

  const [deleteWhiteboard, { loading: deletingWhiteboard }] = useDeleteWhiteboardMutation({});

  const handleDeleteWhiteboard = useCallback(
    async (whiteboard: Identifiable) => {
      if (!whiteboard.id) {
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
          input: {
            ID: whiteboard.id,
          },
        },
      });
    },
    [deleteWhiteboard]
  );

  const handleUploadWhiteboardVisuals = useCallback(
    async (whiteboard: WhiteboardWithPreviewVisuals, previewImages?: WhiteboardPreviewImage[]) => {
      if ((whiteboard.profile.visual || whiteboard.profile.preview) && previewImages) {
        uploadVisuals(
          previewImages,
          { cardVisualId: whiteboard.profile.visual?.id, previewVisualId: whiteboard.profile.preview?.id },
          whiteboard.nameID
        );
      }
      return {
        success: true,
        errors: undefined,
      };
    },
    []
  );

  const [updateWhiteboard, { loading: updatingWhiteboard }] = useUpdateWhiteboardMutation({});
  const handleChangeDisplayName = useCallback(
    async (whiteboardId: string | undefined, displayName: string) => {
      if (!whiteboardId) {
        return;
      }
      await updateWhiteboard({
        variables: {
          input: {
            ID: whiteboardId,
            profile: {
              displayName,
            },
          },
        },
      });
    },
    [updateWhiteboard]
  );

  const actions = useMemo<IWhiteboardActions>(
    () => ({
      onCreate: handleCreateWhiteboard,
      onDelete: handleDeleteWhiteboard,
      onUpdate: handleUploadWhiteboardVisuals,
      onChangeDisplayName: handleChangeDisplayName,
    }),
    [handleUploadWhiteboardVisuals]
  );

  return (
    <>
      {children(
        {},
        {
          creatingWhiteboard,
          deletingWhiteboard,
          updatingWhiteboard,
          uploadingVisuals,
        },
        actions
      )}
    </>
  );
};

export default WhiteboardActionsContainer;
