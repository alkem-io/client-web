import {
  CalloutFramingType,
  type CreateCalloutMutation,
  type CreateReferenceInput,
  type CreateTagsetInput,
} from '@/core/apollo/generated/graphql-schema';
import type { LinkFramingFieldSubmittedValues } from '../../callout/CalloutFramings/LinkFramingFieldSubmittedValues';
import type { MemoFieldSubmittedValues } from '../../memo/model/MemoFieldSubmittedValues';
import type { PollFormFieldSubmittedValues } from '../../poll/models/PollModels';
import type { WhiteboardFieldSubmittedValuesWithPreviewImages } from '../../whiteboard/WhiteboardPreview/WhiteboardField';
import useUploadWhiteboardVisuals from '../../whiteboard/WhiteboardVisuals/useUploadWhiteboardVisuals';
import {
  type CalloutCreationParams,
  type CalloutCreationType,
  type CalloutCreationUtils,
  useCalloutCreation,
} from './useCalloutCreation';

export interface CalloutCreationTypeWithPreviewImages extends CalloutCreationType {
  framing: {
    profile: {
      displayName: string;
      description?: string;
      referencesData?: CreateReferenceInput[];
      tagsets?: CreateTagsetInput[];
    };
    type: CalloutFramingType;
    whiteboard?: WhiteboardFieldSubmittedValuesWithPreviewImages;
    memo?: MemoFieldSubmittedValues;
    link?: LinkFramingFieldSubmittedValues;
    poll?: PollFormFieldSubmittedValues;
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

  // Separates the preview images from the callout data because the preview images are sent separately to the server
  const separatePreviewImages = (callout: CalloutCreationTypeWithPreviewImages) => {
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

  const handleCreateCallout = async (callout: CalloutCreationTypeWithPreviewImages) => {
    // Remove the previewImages from the form data if it's present, to handle it separately
    const { callout: cleanCallout, previewImages } = separatePreviewImages(callout);

    const result = await parentHook.handleCreateCallout(cleanCallout);

    // The PreviewImages (like the ones generated for SingleWhiteboard callouts
    // are sent from here to the server after the callout creation
    if (result && previewImages) {
      const whiteboard =
        callout.framing.type === CalloutFramingType.Whiteboard ? result?.framing.whiteboard : undefined;
      if (whiteboard?.profile) {
        await uploadVisuals(
          previewImages,
          {
            cardVisualId: whiteboard.profile.visual?.id,
            previewVisualId: whiteboard.profile.preview?.id,
          },
          result.nameID // to name the files uploaded as whiteboard visuals
        );
      }
      const memo = callout.framing.type === CalloutFramingType.Memo ? result?.framing.memo : undefined;
      if (memo?.profile?.preview?.id) {
        await uploadVisuals(
          previewImages,
          {
            // TODO:MEMO cardVisualId: memo.profile.visual?.id,
            previewVisualId: memo.profile.preview.id,
          },
          result.nameID // to name the files uploaded as memo visuals
        );
      }
    }

    return result;
  };

  return {
    ...parentHook,
    handleCreateCallout,
  };
};
