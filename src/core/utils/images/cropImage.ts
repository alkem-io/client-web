export interface CropConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

const cropImage = (sourceCanvas: HTMLCanvasElement, crop: CropConfig | undefined): HTMLCanvasElement => {
  if (!crop) {
    return sourceCanvas;
  }

  // Create a new canvas with the crop dimensions
  const canvas = document.createElement('canvas');
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Draw the cropped portion of the source canvas
  ctx.drawImage(
    sourceCanvas,
    crop.x, // source x
    crop.y, // source y
    crop.width, // source width
    crop.height, // source height
    0, // destination x
    0, // destination y
    crop.width, // destination width
    crop.height // destination height
  );

  return canvas;
};

export default cropImage;
