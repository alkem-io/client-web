export type ResizeConfigFunction = (
  imageWidth: number,
  imageHeight: number
) => { height: number; width: number; keepRatio?: boolean };

/**
 *  Resizes an image blob.
 * @param blob image
 * @param getResizeDimensions
 *  function that receives the original image dimensions and returns the desired dimensions,
 *    If keepRatio flag is true, the image will be resized keeping its original aspect ratio.
 *    The dimensions returned by the resizeConfig function will be adjusted so that the image keeps the aspect ratio but is always
 *     smaller than or equal to the requested dimensions.
 * @returns blob
 */
const resizeImage = async (blob: Blob, getResizeDimensions: ResizeConfigFunction): Promise<Blob> => {
  // Create an image from the blob
  const img = new Image();
  const imageUrl = URL.createObjectURL(blob);
  const cleanup = () => URL.revokeObjectURL(imageUrl);

  return new Promise<Blob>((resolve, reject) => {
    img.onload = () => {
      try {
        const { width, height, keepRatio } = getResizeDimensions(img.width, img.height);

        if (width === img.width && height === img.height) {
          // No resizing needed, returning original blob
          cleanup();
          resolve(blob);
          return;
        }
        if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
          cleanup();
          resolve(blob);
          return;
        }

        const canvas = document.createElement('canvas');

        let targetWidth = Math.max(1, Math.round(width));
        let targetHeight = Math.max(1, Math.round(height));

        if (keepRatio) {
          const widthScale = width / img.width;
          const heightScale = height / img.height;
          const scale = Math.min(widthScale, heightScale);

          if (!Number.isFinite(scale) || scale <= 0) {
            cleanup();
            resolve(blob);
            return;
          }

          targetWidth = Math.min(targetWidth, Math.max(1, Math.round(img.width * scale)));
          targetHeight = Math.min(targetHeight, Math.max(1, Math.round(img.height * scale)));
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');

        if (!ctx) {
          cleanup();
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, targetWidth, targetHeight);

        if (!canvas.toBlob) {
          cleanup();
          reject(new Error('Canvas toBlob is not supported'));
          return;
        }

        canvas.toBlob(resizedBlob => {
          cleanup();

          if (resizedBlob) {
            resolve(resizedBlob);
          } else {
            reject(new Error('Failed to create resized blob'));
          }
        }, blob.type || 'image/png');
      } catch (error) {
        cleanup();
        reject(error instanceof Error ? error : new Error('Failed to resize image'));
      }
    };

    img.onerror = () => {
      cleanup();
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};

export default resizeImage;
