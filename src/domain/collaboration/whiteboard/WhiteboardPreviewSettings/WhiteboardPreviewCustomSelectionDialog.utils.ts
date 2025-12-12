import { CropConfig } from '@/core/utils/images/cropImage';

const MIN_SCALE = 1;
const ZERO_PAN = { x: 0, y: 0 };

const clampValue = (value: number, min: number, max: number): number => {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
};

export const clampCoordinatesTranslation = (
  translation: { x: number; y: number },
  img: { width: number; height: number } | null,
  scale: number
): { x: number; y: number } => {
  if (!img) {
    return translation;
  }
  const viewportWidth = img.width;
  const viewportHeight = img.height;
  const maxOffsetX = Math.max(0, (viewportWidth * scale - viewportWidth) / 2);
  const maxOffsetY = Math.max(0, (viewportHeight * scale - viewportHeight) / 2);

  return {
    x: clampValue(translation.x, -maxOffsetX, maxOffsetX),
    y: clampValue(translation.y, -maxOffsetY, maxOffsetY),
  };
};

export const translateCropConfig = ({
  cropConfig,
  img,
  scale = MIN_SCALE,
  pan = ZERO_PAN,
  inverse,
}: {
  cropConfig: CropConfig | undefined;
  img: { width: number; height: number; naturalWidth: number; naturalHeight: number } | null;
  scale?: number;
  pan?: { x: number; y: number };
  inverse?: boolean;
}): CropConfig | undefined => {
  if (!cropConfig || !img) {
    return undefined;
  }

  // Ratio between displayed size and natural (actual) image size
  const displayToNaturalX = img.naturalWidth / img.width;
  const displayToNaturalY = img.naturalHeight / img.height;

  if (inverse) {
    // Converting from natural coordinates to display coordinates (for loading saved crop)
    const naturalToDisplayX = img.width / img.naturalWidth;
    const naturalToDisplayY = img.height / img.naturalHeight;

    return {
      x: cropConfig.x * naturalToDisplayX * scale,
      y: cropConfig.y * naturalToDisplayY * scale,
      width: cropConfig.width * naturalToDisplayX * scale,
      height: cropConfig.height * naturalToDisplayY * scale,
    };
  }

  // Converting from display coordinates to natural coordinates (for saving crop)
  //
  // When scaled, the image is anchored at its center. With pan={0,0} and scale>1,
  // the visible area shows the center portion of the image.
  //
  // The center offset accounts for the fact that scaling from center shifts
  // the origin: at scale=2, the top-left of the visible area is actually at
  // (img.width/4, img.height/4) in unscaled display coordinates.
  //
  // Pan moves the image: positive pan.x moves image right, meaning we see
  // content that's more to the left in natural coordinates, so we subtract pan.
  const centerOffsetX = (img.width * (scale - 1)) / 2;
  const centerOffsetY = (img.height * (scale - 1)) / 2;

  return {
    x: ((cropConfig.x + centerOffsetX - pan.x) * displayToNaturalX) / scale,
    y: ((cropConfig.y + centerOffsetY - pan.y) * displayToNaturalY) / scale,
    width: (cropConfig.width * displayToNaturalX) / scale,
    height: (cropConfig.height * displayToNaturalY) / scale,
  };
};
