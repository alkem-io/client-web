interface DesiredDimensions {
  maxWidth: number;
  maxHeight: number;
  minWidth: number;
  minHeight: number;
  aspectRatio: number;
}

/**
 *  Resizes an image canvas.
 * @param canvas: HTMLCanvasElement to resize
 * @param desiredDimensions DesiredDimensions
 * @returns Canvas
 *  Will return a canvas with the desired aspect ratio.
 *  if the original image has different aspect ratio, it will be cropped in the center.
 *  Image will never have a dimension larger than maxWidth or maxHeight, nor smaller than minWidth or minHeight.
 *  If the image is smaller than minWidth or minHeight, it will be scaled up to meet the minimum dimensions.
 *  If the image is bigger than maxWidth or maxHeight, it will be scaled down to meet the maximum dimensions.
 */
const resizeImage = (canvas: HTMLCanvasElement, desiredDimensions: DesiredDimensions): HTMLCanvasElement => {
  const { maxWidth, maxHeight, minWidth, minHeight, aspectRatio } = desiredDimensions;

  const sourceWidth = canvas.width;
  const sourceHeight = canvas.height;
  const sourceAspectRatio = sourceWidth / sourceHeight;

  // Calculate the dimensions after cropping to match desired aspect ratio
  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;
  let cropX = 0;
  let cropY = 0;

  if (sourceAspectRatio > aspectRatio) {
    // Source is wider than desired aspect ratio, crop the width
    cropWidth = sourceHeight * aspectRatio;
    cropX = (sourceWidth - cropWidth) / 2;
  } else if (sourceAspectRatio < aspectRatio) {
    // Source is taller than desired aspect ratio, crop the height
    cropHeight = sourceWidth / aspectRatio;
    cropY = (sourceHeight - cropHeight) / 2;
  }

  // Calculate the final dimensions respecting min and max constraints
  let finalWidth = cropWidth;
  let finalHeight = cropHeight;

  // Scale down if larger than max dimensions
  if (finalWidth > maxWidth || finalHeight > maxHeight) {
    const scaleX = maxWidth / finalWidth;
    const scaleY = maxHeight / finalHeight;
    const scale = Math.min(scaleX, scaleY);
    finalWidth = finalWidth * scale;
    finalHeight = finalHeight * scale;
  }

  // Scale up if smaller than min dimensions
  if (finalWidth < minWidth || finalHeight < minHeight) {
    const scaleX = minWidth / finalWidth;
    const scaleY = minHeight / finalHeight;
    const scale = Math.max(scaleX, scaleY);
    finalWidth = finalWidth * scale;
    finalHeight = finalHeight * scale;
  }

  // Create a new canvas with the final dimensions
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = Math.round(finalWidth);
  outputCanvas.height = Math.round(finalHeight);

  const ctx = outputCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context from canvas');
  }

  // Draw the cropped and resized image
  ctx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, finalWidth, finalHeight);

  return outputCanvas;
};

export default resizeImage;
