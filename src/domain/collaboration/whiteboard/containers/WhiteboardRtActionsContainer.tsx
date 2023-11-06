import { FC, useCallback, useMemo } from 'react';
import { useUpdateWhiteboardContentRtMutation } from '../../../../core/apollo/generated/apollo-hooks';
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
  const [updateWhiteboardContent, { loading: updatingWhiteboard }] = useUpdateWhiteboardContentRtMutation({});
  const { uploadVisuals, loading: uploadingVisuals } = useUploadWhiteboardVisuals();

  const handleUpdateWhiteboardContent = useCallback(
    async (whiteboard: WhiteboardRtContentFragment & WhiteboardRtDetailsFragment) => {
      await updateWhiteboardContent({
        variables: {
          input: {
            ID: whiteboard.id,
            content: whiteboard.content,
          },
        },
      });
    },
    [updateWhiteboardContent, uploadVisuals]
  );

  const actions = useMemo<IWhiteboardRtActions>(
    () => ({
      onUpdate: handleUpdateWhiteboardContent,
    }),
    [handleUpdateWhiteboardContent]
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
