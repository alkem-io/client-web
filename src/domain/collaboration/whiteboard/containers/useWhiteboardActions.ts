import {
  useCreateWhiteboardOnCalloutMutation,
  useDeleteWhiteboardMutation,
  useUpdateWhiteboardMutation,
  WhiteboardDetailsFragmentDoc,
} from '@/core/apollo/generated/apollo-hooks';
import type { CreateWhiteboardInput } from '@/core/apollo/generated/graphql-schema';
import { evictFromCache } from '@/core/apollo/utils/removeFromCache';
import type { Identifiable } from '@/core/utils/Identifiable';
import useUploadWhiteboardVisuals from '../WhiteboardVisuals/useUploadWhiteboardVisuals';
import type { WhiteboardPreviewImage } from '../WhiteboardVisuals/WhiteboardPreviewImagesModels';

interface WhiteboardWithPreviewVisuals {
  nameID: string;
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
    calloutId: string,
    whiteboard: CreateWhiteboardInput,
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

const useWhiteboardActions = () => {
  const [createWhiteboard, { loading: creatingWhiteboard }] = useCreateWhiteboardOnCalloutMutation({});
  const { uploadVisuals, loading: uploadingVisuals } = useUploadWhiteboardVisuals();

  const handleCreateWhiteboard = async (
    calloutId: string,
    whiteboard: CreateWhiteboardInput,
    previewImages?: WhiteboardPreviewImage[]
  ) => {
    if (!calloutId) {
      throw new Error('[whiteboard:onCreate]: Missing contextID');
    }

    const result = await createWhiteboard({
      update(cache, { data }) {
        cache.modify({
          id: cache.identify({
            id: calloutId,
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
        calloutId,
        whiteboard,
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
  };

  const [deleteWhiteboard, { loading: deletingWhiteboard }] = useDeleteWhiteboardMutation({});

  const handleDeleteWhiteboard = async (whiteboard: Identifiable) => {
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
  };

  const handleUploadWhiteboardVisuals = async (
    whiteboard: WhiteboardWithPreviewVisuals,
    previewImages?: WhiteboardPreviewImage[]
  ) => {
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
  };

  const [updateWhiteboard, { loading: updatingWhiteboard }] = useUpdateWhiteboardMutation({});
  const handleChangeDisplayName = async (whiteboardId: string | undefined, displayName: string) => {
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
  };

  const actions = {
    onCreate: handleCreateWhiteboard,
    onDelete: handleDeleteWhiteboard,
    onUpdate: handleUploadWhiteboardVisuals,
    onChangeDisplayName: handleChangeDisplayName,
  };

  const state: WhiteboardActionsContainerState = {
    creatingWhiteboard,
    deletingWhiteboard,
    updatingWhiteboard,
    uploadingVisuals,
  };

  return { state, actions };
};

export default useWhiteboardActions;
