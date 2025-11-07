import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { WhiteboardPreviewSettings } from '../WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import { WhiteboardPreviewImage } from '../WhiteboardVisuals/WhiteboardPreviewImagesModels';

export interface WhiteboardFieldSubmittedValues {
  content: string;
  profile: {
    displayName: string;
    visuals?: {
      // Used if we use a template coming with the whiteboards visuals
      name: VisualType;
      uri: string;
    }[];
  };
  previewSettings: WhiteboardPreviewSettings | undefined; // used if we edit the whiteboard and produces it's own visuals
}

export interface WhiteboardFieldSubmittedValuesWithPreviewImages extends WhiteboardFieldSubmittedValues {
  // Whiteboard Preview Images are sent as visuals in a different call to the server after the callout is saved (See useCalloutCreationWithPreviewImages.ts)
  previewImages: WhiteboardPreviewImage[] | undefined;
}
