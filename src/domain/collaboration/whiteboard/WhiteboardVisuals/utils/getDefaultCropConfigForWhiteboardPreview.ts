import { CropConfig } from '@/core/utils/images/cropImage';

/**
 * Gets the default crop config for an image, which is the maximum centered crop keeping aspect ratio
 * @param imageWidth
 * @param imageHeight
 * @param aspectRatio
 * @returns CropConfig { x, y, width, height }
 */
export const getDefaultCropConfigForWhiteboardPreview = (
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number
): CropConfig => {
  if (imageWidth <= 0 || imageHeight <= 0) {
    return {
      x: 0,
      y: 0,
      width: imageWidth,
      height: imageHeight,
    };
  }
  // Calculate the aspect ratio of the source image
  const sourceAspectRatio = imageWidth / imageHeight;

  let cropWidth: number;
  let cropHeight: number;

  // Determine which dimension should be maxed out
  if (sourceAspectRatio > aspectRatio) {
    // Image is wider than target aspect ratio - constrain by height
    cropHeight = imageHeight;
    cropWidth = cropHeight * aspectRatio;
  } else {
    // Image is taller than target aspect ratio - constrain by width
    cropWidth = imageWidth;
    cropHeight = cropWidth / aspectRatio;
  }

  // Center the crop area
  const x = (imageWidth - cropWidth) / 2;
  const y = (imageHeight - cropHeight) / 2;

  return {
    x,
    y,
    width: cropWidth,
    height: cropHeight,
  };
};
