import { ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import { VisualModel } from '@/domain/common/visual/model/VisualModel';
import { WhiteboardPreviewImage } from '../../whiteboard/WhiteboardPreviewImages/WhiteboardPreviewImages';

export interface MemoFieldSubmittedValues {
  contentUpdatePolicy?: ContentUpdatePolicy;
  profile: {
    displayName: string;
    preview?: VisualModel;
    url?: string;
  };
  content: string;
  previewImages: WhiteboardPreviewImage[]; //!! TODO: Pending to see if we are going to use this field
}
