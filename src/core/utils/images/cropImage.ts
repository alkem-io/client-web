export interface CropConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CropConfigFunction = (imageWidth: number, imageHeight: number) => CropConfig | undefined;

const cropImage = async (blob: Blob, getCropConfig: CropConfigFunction): Promise<Blob> => {
  // Create an image from the blob
  const img = new Image();
  const imageUrl = URL.createObjectURL(blob);

  return new Promise<Blob>((resolve, reject) => {
    img.onload = () => {
      const crop = getCropConfig(img.width, img.height);
      if (!crop) {
        return blob;
      }
      // Create a canvas with the crop dimensions
      const canvas = document.createElement('canvas');
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw the cropped portion of the image
      ctx.drawImage(
        img,
        crop.x, // source x
        crop.y, // source y
        crop.width, // source width
        crop.height, // source height
        0, // destination x
        0, // destination y
        crop.width, // destination width
        crop.height // destination height
      );

      // Clean up the object URL
      URL.revokeObjectURL(imageUrl);

      // Convert canvas to blob
      canvas.toBlob(croppedBlob => {
        if (croppedBlob) {
          resolve(croppedBlob);
        } else {
          reject(new Error('Failed to create cropped blob'));
        }
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};

export default cropImage;
