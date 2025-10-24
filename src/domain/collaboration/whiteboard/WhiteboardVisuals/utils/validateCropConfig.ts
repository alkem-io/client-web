import { CropConfig } from '@/core/utils/images/cropImage';

const ASPECT_RATIO_TOLERANCE = 0.01; // Allow 1% difference between aspect ratios

const validateCropConfig = (
  cropConfig: CropConfig | undefined,
  aspectRatio: number,
  img: { width: number; height: number }
) =>
  cropConfig &&
  cropConfig.x >= 0 &&
  cropConfig.y >= 0 &&
  cropConfig.width >= 1 &&
  cropConfig.height >= 1 &&
  // Allow some tolerance in aspectRatio comparison
  Math.abs(cropConfig.width / cropConfig.height - aspectRatio) <= ASPECT_RATIO_TOLERANCE &&
  // Make sure crop fits within image bounds
  cropConfig.x + cropConfig.width <= img.width &&
  cropConfig.y + cropConfig.height <= img.height;

export default validateCropConfig;
