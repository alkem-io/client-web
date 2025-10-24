import { VisualType } from '@/core/apollo/generated/graphql-schema';

export interface PreviewImageDimensions {
  maxWidth: number;
  maxHeight: number;
  minWidth: number;
  minHeight: number;
  aspectRatio: number;
  minScale?: number;
}

export interface WhiteboardPreviewImage {
  visualType: VisualType;
  imageData: Blob;
}
