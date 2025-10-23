import { PreviewImageDimensions } from '../model/WhiteboardPreviewImagesModels';

/**
 * Creates a crop configuration function that calculates the largest possible crop centered in the original image,
 * while maintaining the aspect ratio and dimension constraints.
 *
 * The returned function receives an image's width and height, and returns cropping coordinates (x, y, width, height)
 * that are within the image boundaries and meet the constraints' maxWidth, maxHeight, and aspectRatio.
 *
 * If the image doesn't meet the minimum width or height restrictions, it returns undefined to keep the image
 * as is (see cropImage implementation).
 *
 * @param constraints - The dimension constraints including minWidth, minHeight, maxWidth, maxHeight, and aspectRatio
 * @returns A function that takes image dimensions and returns crop coordinates or undefined
 */
const cropImageWithConstraints = (constraints: PreviewImageDimensions) => {
  return (imageWidth, imageHeight) => {
    // Check if image meets minimum dimensions
    if (imageWidth < constraints.minWidth || imageHeight < constraints.minHeight) {
      return undefined; // Return image as is
    }

    const targetAspectRatio = constraints.aspectRatio;

    // Calculate the dimensions for the largest crop that fits the aspect ratio
    let cropWidth: number;
    let cropHeight: number;

    const currentAspectRatio = imageWidth / imageHeight;

    if (currentAspectRatio > targetAspectRatio) {
      // Image is wider than target aspect ratio, constrain by height
      cropHeight = Math.min(imageHeight, constraints.maxHeight);
      cropWidth = cropHeight * targetAspectRatio;
    } else {
      // Image is taller than target aspect ratio, constrain by width
      cropWidth = Math.min(imageWidth, constraints.maxWidth);
      cropHeight = cropWidth / targetAspectRatio;
    }

    // Ensure crop dimensions don't exceed image dimensions
    if (cropWidth > imageWidth) {
      cropWidth = imageWidth;
      cropHeight = cropWidth / targetAspectRatio;
    }
    if (cropHeight > imageHeight) {
      cropHeight = imageHeight;
      cropWidth = cropHeight * targetAspectRatio;
    }

    // Ensure crop dimensions don't exceed max constraints
    if (cropWidth > constraints.maxWidth) {
      cropWidth = constraints.maxWidth;
      cropHeight = cropWidth / targetAspectRatio;
    }
    if (cropHeight > constraints.maxHeight) {
      cropHeight = constraints.maxHeight;
      cropWidth = cropHeight * targetAspectRatio;
    }

    // Center the crop in the original image
    const x = (imageWidth - cropWidth) / 2;
    const y = (imageHeight - cropHeight) / 2;

    return {
      width: cropWidth,
      height: cropHeight,
      x,
      y,
    };
  };
};

export default cropImageWithConstraints;
