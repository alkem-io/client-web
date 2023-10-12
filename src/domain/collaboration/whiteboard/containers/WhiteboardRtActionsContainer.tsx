import { FC, useCallback, useMemo } from 'react';
import { useUpdateWhiteboardRtMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  WhiteboardRtDetailsFragment,
  WhiteboardRtContentFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { WhiteboardPreviewImage, useUploadWhiteboardVisuals } from '../WhiteboardPreviewImages/WhiteboardPreviewImages';

export interface IWhiteboardRtActions {
  onUpdate: (
    whiteboard: WhiteboardRtContentFragment & WhiteboardRtDetailsFragment,
    previewImages?: WhiteboardPreviewImage[]
  ) => Promise<void>;
}

export interface WhiteboardRtActionsContainerState {
  creatingWhiteboard?: boolean;
  deletingWhiteboard?: boolean;
  changingWhiteboardLockState?: boolean;
  updatingWhiteboard?: boolean;
}

export interface WhiteboardRtActionsContainerProps
  extends ContainerChildProps<{}, IWhiteboardRtActions, WhiteboardRtActionsContainerState> {}

const WhiteboardRtActionsContainer: FC<WhiteboardRtActionsContainerProps> = ({ children }) => {
  const [updateWhiteboard, { loading: updatingWhiteboard }] = useUpdateWhiteboardRtMutation({});
  const { uploadVisuals, loading: uploadingVisuals } = useUploadWhiteboardVisuals();

  const handleUpdateWhiteboard = useCallback(
    async (
      whiteboard: WhiteboardRtContentFragment & WhiteboardRtDetailsFragment,
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

  const actions = useMemo<IWhiteboardRtActions>(
    () => ({
      onUpdate: handleUpdateWhiteboard,
    }),
    [handleUpdateWhiteboard]
  );

  return (
    <>
      {children(
        {},
        {
          updatingWhiteboard: updatingWhiteboard || uploadingVisuals,
        },
        actions
      )}
    </>
  );
};

export default WhiteboardRtActionsContainer;
