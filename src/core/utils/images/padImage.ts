/**
 * Pads a canvas with uniform borders so it matches the desired aspect ratio.
 * The original image is centered on the new canvas and the uncovered area is
 * filled using the provided background color (defaults to white).
 *
 * @param canvas Source canvas that should be padded.
 * @param targetAspectRatio Desired width / height ratio for the final canvas.
 * @param backgroundColor Fill style used for the padding region; defaults to white.
 * @returns The original canvas when no padding is needed, otherwise a new padded canvas.
 */
export const padImage = (
  canvas: HTMLCanvasElement,
  targetAspectRatio: number,
  backgroundColor: CanvasFillStrokeStyles['fillStyle'] = '#FFFFFF'
): HTMLCanvasElement => {
  const { width, height } = canvas;

  if (!width || !height) {
    return canvas;
  }

  const currentAspectRatio = width / height;

  // Allow a small tolerance to skip unnecessary work when ratios already match closely.
  if (Math.abs(currentAspectRatio - targetAspectRatio) < 0.01) {
    return canvas;
  }

  let paddedWidth = width;
  let paddedHeight = height;
  let offsetX = 0;
  let offsetY = 0;

  if (currentAspectRatio > targetAspectRatio) {
    paddedHeight = Math.round(width / targetAspectRatio);
    offsetY = (paddedHeight - height) / 2;
  } else {
    paddedWidth = Math.round(height * targetAspectRatio);
    offsetX = (paddedWidth - width) / 2;
  }

  const paddedCanvas = document.createElement('canvas');
  paddedCanvas.width = paddedWidth;
  paddedCanvas.height = paddedHeight;

  const context = paddedCanvas.getContext('2d');
  if (!context) {
    return canvas;
  }

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, paddedWidth, paddedHeight);
  context.drawImage(canvas, offsetX, offsetY);

  return paddedCanvas;
};
