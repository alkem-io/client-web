export type CropRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ImageDimensions = {
  /** Rendered (layout) size of the <img> element, in CSS pixels. */
  width: number;
  height: number;
  /** Intrinsic size of the source image, in image pixels. */
  naturalWidth: number;
  naturalHeight: number;
};

const ASPECT_RATIO_TOLERANCE = 0.01; // Allow 1% difference between aspect ratios
const BOUNDS_TOLERANCE = 0.01; // Absorb float drift from the natural→display round-trip (scale/pan math)

/**
 * Crop selections live in two coordinate spaces:
 *
 * - **display** — what `react-image-crop` reports, relative to the rendered `<img>` layout box.
 * - **natural** — the source image's full resolution, which the whiteboard preview generator
 *   crops against and which is persisted in `WhiteboardPreviewSettings.coordinates`.
 *
 * The image is rendered with a center-anchored `translate(pan) scale(scale)` CSS transform, so the
 * conversion must undo that pan/zoom before rescaling to natural pixels. These helpers are the pure
 * counterpart of the MUI `WhiteboardPreviewCustomSelectionDialog.utils.ts:translateCropConfig`.
 */
export function displayCropToNatural(
  crop: CropRegion,
  img: ImageDimensions,
  scale: number,
  pan: { x: number; y: number }
): CropRegion {
  const displayToNaturalX = img.naturalWidth / img.width;
  const displayToNaturalY = img.naturalHeight / img.height;

  // Scaling anchors at the image center, so at scale > 1 the top-left of the visible area sits at
  // (width * (scale - 1) / 2) in unscaled display coordinates. Pan then shifts the image: a positive
  // pan moves the image right, exposing content further left in natural space, hence the subtraction.
  const centerOffsetX = (img.width * (scale - 1)) / 2;
  const centerOffsetY = (img.height * (scale - 1)) / 2;

  return {
    x: ((crop.x + centerOffsetX - pan.x) * displayToNaturalX) / scale,
    y: ((crop.y + centerOffsetY - pan.y) * displayToNaturalY) / scale,
    width: (crop.width * displayToNaturalX) / scale,
    height: (crop.height * displayToNaturalY) / scale,
  };
}

/** Inverse of {@link displayCropToNatural} — maps a stored natural-pixel crop back to display space. */
export function naturalCropToDisplay(
  crop: CropRegion,
  img: ImageDimensions,
  scale: number,
  pan: { x: number; y: number }
): CropRegion {
  const naturalToDisplayX = img.width / img.naturalWidth;
  const naturalToDisplayY = img.height / img.naturalHeight;

  const centerOffsetX = (img.width * (scale - 1)) / 2;
  const centerOffsetY = (img.height * (scale - 1)) / 2;

  return {
    x: crop.x * naturalToDisplayX * scale - centerOffsetX + pan.x,
    y: crop.y * naturalToDisplayY * scale - centerOffsetY + pan.y,
    width: crop.width * naturalToDisplayX * scale,
    height: crop.height * naturalToDisplayY * scale,
  };
}

/** Whether a crop fits within the image bounds and matches the target aspect ratio. */
export function isCropWithinImage(
  crop: CropRegion | undefined,
  aspectRatio: number,
  img: { width: number; height: number }
): crop is CropRegion {
  return (
    !!crop &&
    crop.x >= -BOUNDS_TOLERANCE &&
    crop.y >= -BOUNDS_TOLERANCE &&
    crop.width >= 1 &&
    crop.height >= 1 &&
    Math.abs(crop.width / crop.height - aspectRatio) <= ASPECT_RATIO_TOLERANCE &&
    crop.x + crop.width <= img.width + BOUNDS_TOLERANCE &&
    crop.y + crop.height <= img.height + BOUNDS_TOLERANCE
  );
}
