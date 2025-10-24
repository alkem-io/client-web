import { PreviewImageDimensions } from './WhiteboardPreviewImagesModels';

// TODO: This should be coming from the server:
export const WhiteboardPreviewVisualDimensions: PreviewImageDimensions = {
  minWidth: 500,
  maxWidth: 1800,
  minHeight: 200,
  maxHeight: 720,
  aspectRatio: 2.5,
};

export const CardVisualDimensions: PreviewImageDimensions = {
  minWidth: 307,
  maxWidth: 410,
  minHeight: 192,
  maxHeight: 256,
  aspectRatio: 1.6,
};
