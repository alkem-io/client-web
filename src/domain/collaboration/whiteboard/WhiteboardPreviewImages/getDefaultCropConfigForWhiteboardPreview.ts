export const getDefaultCropConfigForWhiteboardPreview = (
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number,
  maxWidth: number,
  maxHeight: number
) => {
  if (imageWidth === 0 || imageHeight === 0) {
    throw new Error('Image dimensions must be greater than zero');
  }

  const imageAspectRatio = imageWidth / imageHeight;
  let x = 0,
    y = 0;
  if (imageAspectRatio > aspectRatio) {
    // Image is wider than desired aspect ratio
    // Try to take full height:
    const cropHeight = Math.min(imageHeight, maxHeight);
    const cropWidth = cropHeight * aspectRatio;
    x = Math.max(
      0,
      Math.min(
        imageWidth / 2 - cropWidth / 2, // desired x, centered horizontally
        imageWidth - cropWidth // max x to not overflow
      )
    );
    return {
      width: cropWidth,
      height: cropHeight,
      x,
      y,
    };
  } else {
    // Try to take full width:
    const cropWidth = Math.min(imageWidth, maxWidth);
    const cropHeight = cropWidth / aspectRatio;
    y = Math.max(
      0,
      Math.min(
        imageHeight / 2 - cropHeight / 2, // desired y, centered vertically
        imageHeight - cropHeight // max y to not overflow
      )
    );
    return {
      width: cropWidth,
      height: cropHeight,
      x,
      y,
    };
  }
};
