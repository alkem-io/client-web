import { WhiteboardPreviewImage } from '../WhiteboardVisuals/WhiteboardPreviewImagesModels';

export interface WhiteboardFieldSubmittedValues {
  content: string;
  profile: {
    displayName: string;
  };
}

export interface WhiteboardFieldSubmittedValuesWithPreviewImages extends WhiteboardFieldSubmittedValues {
  // Whiteboard Preview Images are sent as visuals in a different call to the server after the callout is saved (See useCalloutCreationWithPreviewImages.ts)
  previewImages: WhiteboardPreviewImage[] | undefined;
}
