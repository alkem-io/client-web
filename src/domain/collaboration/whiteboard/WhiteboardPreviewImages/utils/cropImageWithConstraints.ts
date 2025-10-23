import { PreviewImageDimensions } from '../model/WhiteboardPreviewImagesModels';

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
