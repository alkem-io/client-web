import { useCallback } from 'react';
import { WhiteboardFieldSubmittedValuesWithPreviewImages } from '../CalloutWhiteboardField/CalloutWhiteboardField';
import { useUploadWhiteboardVisuals } from '../../../canvas/WhiteboardPreviewImages/WhiteboardPreviewImages';
import { CalloutCreationType, CalloutCreationUtils, useCalloutCreation } from './useCalloutCreation';
import { CreateCalloutMutation } from '../../../../../core/apollo/generated/graphql-schema';

export interface CalloutCreationTypeWithPreviewImages extends Omit<CalloutCreationType, 'whiteboard'> {
  whiteboard?: WhiteboardFieldSubmittedValuesWithPreviewImages;
}

export interface CalloutCreationUtilsWithPreviewImages extends Omit<CalloutCreationUtils, 'handleCreateCallout'> {
  handleCreateCallout: (
    callout: CalloutCreationTypeWithPreviewImages
  ) => Promise<CreateCalloutMutation['createCalloutOnCollaboration'] | undefined>;
}

export const useCalloutCreationWithPreviewImages = (initialOpened = false): CalloutCreationUtilsWithPreviewImages => {
  const { uploadVisuals } = useUploadWhiteboardVisuals();
  const parentHook = useCalloutCreation(initialOpened);

  const handlePreviewImages = (callout: CalloutCreationTypeWithPreviewImages) => {
    if (callout.whiteboard) {
      const {
        whiteboard: { previewImages, ...restWhiteboard },
        ...restCallout
      } = callout;
      return { callout: { whiteboard: restWhiteboard, ...restCallout }, previewImages };
    }
    return { callout };
  };

  const handleCreateCallout = useCallback(
    async (callout: CalloutCreationTypeWithPreviewImages) => {
      // Remove the previewImages from the form data if it's present, to handle it separatelly
      const { callout: cleanCallout, previewImages } = handlePreviewImages(callout);

      const result = await parentHook.handleCreateCallout(cleanCallout);

      // The PreviewImages (like the ones generated for SingleCanvas callouts
      // are sent from here to the server after the callout creation
      if (result && previewImages) {
        const canvas = result?.canvases?.[0];
        if (canvas && canvas.profile) {
          await uploadVisuals(
            previewImages,
            {
              cardVisualId: canvas.profile.visual?.id,
              previewVisualId: canvas.profile.preview?.id,
            },
            result.nameID
          );
        }
      }

      return result;
    },
    [parentHook, uploadVisuals]
  );

  return {
    ...parentHook,
    handleCreateCallout,
  };
};
