import { useCallback } from 'react';
import { WhiteboardFieldSubmittedValuesWithPreviewImages } from '../CalloutWhiteboardField/CalloutWhiteboardField';
import { WhiteboardRtFieldSubmittedValuesWithPreviewImages } from '../CalloutWhiteboardField/CalloutWhiteboardRtField';
import { useUploadWhiteboardVisuals } from '../../../whiteboard/WhiteboardPreviewImages/WhiteboardPreviewImages';
import { CalloutCreationType, CalloutCreationUtils, useCalloutCreation } from './useCalloutCreation';
import {
  CalloutType,
  CreateCalloutMutation,
  CreateTagsetInput,
  Reference,
} from '../../../../../core/apollo/generated/graphql-schema';

export interface CalloutCreationTypeWithPreviewImages extends CalloutCreationType {
  framing: {
    profile: {
      description: string;
      displayName: string;
      referencesData: Reference[];
      tagsets?: CreateTagsetInput[];
    };
    whiteboard?: WhiteboardFieldSubmittedValuesWithPreviewImages;
    whiteboardRt?: WhiteboardRtFieldSubmittedValuesWithPreviewImages;
    tags?: string[];
  };
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
    if (callout.framing.whiteboard) {
      const {
        framing: {
          whiteboard: { previewImages, ...restWhiteboard },
          ...restFraming
        },
        ...restCallout
      } = callout;
      return { callout: { framing: { whiteboard: restWhiteboard, ...restFraming }, ...restCallout }, previewImages };
    }
    if (callout.framing.whiteboardRt) {
      const {
        framing: {
          whiteboardRt: { previewImages, ...restWhiteboard },
          ...restFraming
        },
        ...restCallout
      } = callout;
      return { callout: { framing: { whiteboardRt: restWhiteboard, ...restFraming }, ...restCallout }, previewImages };
    }
    return { callout };
  };

  const handleCreateCallout = useCallback(
    async (callout: CalloutCreationTypeWithPreviewImages) => {
      // Remove the previewImages from the form data if it's present, to handle it separatelly
      const { callout: cleanCallout, previewImages } = handlePreviewImages(callout);

      const result = await parentHook.handleCreateCallout(cleanCallout);

      // The PreviewImages (like the ones generated for SingleWhiteboard callouts
      // are sent from here to the server after the callout creation
      if (result && previewImages) {
        const whiteboard =
          callout.type === CalloutType.Whiteboard
            ? result?.framing.whiteboard
            : callout.type === CalloutType.WhiteboardRt
            ? result?.framing.whiteboardRt
            : undefined;
        if (whiteboard && whiteboard.profile) {
          await uploadVisuals(
            previewImages,
            {
              cardVisualId: whiteboard.profile.visual?.id,
              previewVisualId: whiteboard.profile.preview?.id,
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
