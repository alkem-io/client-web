import { PreviewImageDimensions } from './WhiteboardPreviewImages';

// TODO: This should be coming from the server:
export const BannerNarrowDimensions: PreviewImageDimensions = {
  maxHeight: 256,
  maxWidth: 410,
  minHeight: 192,
  minWidth: 307,
  aspectRatio: 1.6,
};

export const BannerDimensions: PreviewImageDimensions = {
  minWidth: 384,
  maxWidth: 1536,
  minHeight: 64,
  maxHeight: 256,
  aspectRatio: 6,
};

export const WhiteboardPreviewVisualDimensions: PreviewImageDimensions = {
  minWidth: 385,
  maxWidth: 1535,
  minHeight: 154,
  maxHeight: 614,
  aspectRatio: 2.5,
};
