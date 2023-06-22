import { PreviewImageDimensions } from './WhiteboardPreviewImages';

// TODO: This should be coming from the server:
export const BannerNarrowDimensions: PreviewImageDimensions = {
  maxHeight: 256,
  maxWidth: 410,
  minHeight: 192,
  minWidth: 307,
};

export const BannerDimensions: PreviewImageDimensions = {
  minWidth: 384,
  maxWidth: 1536,
  minHeight: 64,
  maxHeight: 256,
};
