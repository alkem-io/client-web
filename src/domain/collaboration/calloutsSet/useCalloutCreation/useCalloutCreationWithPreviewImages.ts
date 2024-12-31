import { useCallback } from 'react';
import { WhiteboardFieldSubmittedValuesWithPreviewImages } from '../../callout/creationDialog/CalloutWhiteboardField/CalloutWhiteboardField';
import { useUploadWhiteboardVisuals } from '@/domain/collaboration/whiteboard/WhiteboardPreviewImages/WhiteboardPreviewImages';
import {
  CalloutCreationParams,
  CalloutCreationType,
  CalloutCreationUtils,
  useCalloutCreation,
} from './useCalloutCreation';
import {
  CalloutType,
  CreateCalloutMutation,
  CreateReferenceInput,
  CreateTagsetInput,
} from '@/core/apollo/generated/graphql-schema';

export interface CalloutCreationTypeWithPreviewImages extends CalloutCreationType {
  framing: {
    profile: {
      description: string;
      displayName: string;
      referencesData: CreateReferenceInput[];
      tagsets?: CreateTagsetInput[];
    };
    whiteboard?: WhiteboardFieldSubmittedValuesWithPreviewImages;
    tags?: string[];
  };
}

export interface CalloutCreationUtilsWithPreviewImages extends Omit<CalloutCreationUtils, 'handleCreateCallout'> {
  handleCreateCallout: (
    callout: CalloutCreationTypeWithPreviewImages
  ) => Promise<CreateCalloutMutation['createCalloutOnCalloutsSet'] | undefined>;
}

export const useCalloutCreationWithPreviewImages = (
  options: CalloutCreationParams
): CalloutCreationUtilsWithPreviewImages => {
  const { uploadVisuals } = useUploadWhiteboardVisuals();
  const parentHook = useCalloutCreation(options);

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
        const whiteboard = callout.type === CalloutType.Whiteboard ? result?.framing.whiteboard : undefined;
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
