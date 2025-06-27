import { CreateProfileInput } from '@/core/apollo/generated/graphql-schema';
import { WhiteboardPreviewImage } from '../WhiteboardPreviewImages/WhiteboardPreviewImages';

export interface WhiteboardFieldSubmittedValues {
  content: string;
  profile: CreateProfileInput;
}

export interface WhiteboardFieldSubmittedValuesWithPreviewImages extends WhiteboardFieldSubmittedValues {
  // Whiteboard Preview Images are sent as visuals in a different call to the server after the callout is saved (See useCalloutCreationWithPreviewImages.ts)
  previewImages: WhiteboardPreviewImage[] | undefined;
}
