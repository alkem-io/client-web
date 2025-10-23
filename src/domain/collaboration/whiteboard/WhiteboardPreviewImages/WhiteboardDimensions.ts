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
  minWidth: 300,
  maxWidth: 1800,
  minHeight: 120,
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
