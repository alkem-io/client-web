import { FC, useCallback, useMemo } from 'react';
import { useUpdateWhiteboardContentRtMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  WhiteboardRtDetailsFragment,
  WhiteboardRtContentFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { WhiteboardPreviewImage } from '../WhiteboardPreviewImages/WhiteboardPreviewImages';

export interface IWhiteboardRtActions {
  onUpdate: (
    whiteboard: WhiteboardRtContentFragment & WhiteboardRtDetailsFragment,
    previewImages?: WhiteboardPreviewImage[]
  ) => Promise<{ success: boolean; errors?: string[] }>;
}

export interface WhiteboardRtActionsContainerState {
  creatingWhiteboard?: boolean;
  deletingWhiteboard?: boolean;
  changingWhiteboardLockState?: boolean;
  updatingWhiteboard?: boolean;
  updatingWhiteboardContent?: boolean;
}

export interface WhiteboardRtActionsContainerProps
  extends ContainerChildProps<{}, IWhiteboardRtActions, WhiteboardRtActionsContainerState> {}

const WhiteboardRtActionsContainer: FC<WhiteboardRtActionsContainerProps> = ({ children }) => {
  const [updateWhiteboardContent, { loading: updatingWhiteboardContent }] = useUpdateWhiteboardContentRtMutation({});

  const handleUpdateWhiteboardContent = useCallback(
    async (whiteboard: WhiteboardRtContentFragment & WhiteboardRtDetailsFragment) => {
      const result = await updateWhiteboardContent({
        variables: {
          input: {
            ID: whiteboard.id,
            content: whiteboard.content,
          },
        },
      });
      return {
        success: !result.errors || result.errors.length === 0,
        errors: result.errors?.map(({ message }) => message),
      };
    },
    [updateWhiteboardContent]
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
          updatingWhiteboardContent,
        },
        actions
      )}
    </>
  );
};

export default WhiteboardRtActionsContainer;
