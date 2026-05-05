export type VisualConstraints = {
  maxWidth: number;
  maxHeight: number;
  minWidth: number;
  minHeight: number;
  aspectRatio: number;
  allowedTypes: string[];
};

export type ResizeResult = { ok: true; file: File } | { ok: false; reason: 'tooSmall' | 'loadFailed' };

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });

/**
 * Center-crops the uploaded image to the constraint's aspect ratio, then scales
 * it to fit within the allowed max dimensions. Returns a JPEG File that will
 * pass the backend's visual type constraints.
 *
 * If the source image is smaller than the required minimum on either axis
 * (after cropping to the target aspect), returns `{ ok: false }` — upscaling
 * produces unusable output, so the caller surfaces an error instead.
 */
export async function resizeImageToConstraints(file: File, constraints: VisualConstraints): Promise<ResizeResult> {
  let image: HTMLImageElement;
  try {
    image = await loadImage(file);
  } catch {
    return { ok: false, reason: 'loadFailed' };
  }

  const { maxWidth, maxHeight, minWidth, minHeight, aspectRatio } = constraints;
  const sourceAspect = image.naturalWidth / image.naturalHeight;

  let cropWidth: number;
  let cropHeight: number;
  if (sourceAspect > aspectRatio) {
    cropHeight = image.naturalHeight;
    cropWidth = cropHeight * aspectRatio;
  } else {
    cropWidth = image.naturalWidth;
    cropHeight = cropWidth / aspectRatio;
  }
  const cropX = (image.naturalWidth - cropWidth) / 2;
  const cropY = (image.naturalHeight - cropHeight) / 2;

  if (cropWidth < minWidth || cropHeight < minHeight) {
    return { ok: false, reason: 'tooSmall' };
  }

  const scale = Math.min(1, maxWidth / cropWidth, maxHeight / cropHeight);
  const targetWidth = Math.round(cropWidth * scale);
  const targetHeight = Math.round(cropHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { ok: false, reason: 'loadFailed' };
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/jpeg', 0.9));
  if (!blob) return { ok: false, reason: 'loadFailed' };

  const baseName = file.name.replace(/\.[^.]+$/, '');
  const resized = new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
  return { ok: true, file: resized };
}
