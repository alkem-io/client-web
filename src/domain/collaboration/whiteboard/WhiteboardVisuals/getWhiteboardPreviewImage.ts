import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import type { exportToCanvas as ExcalidrawExportToCanvas } from '@alkemio/excalidraw/dist/types/utils/src/export';
import { lazyImportWithErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { error as logError } from '@/core/logging/sentry/log';
import { padImage } from '@/core/utils/images/padImage';
import createFallbackWhiteboardPreview from './createFallbackWhiteboardPreview';
import { WhiteboardPreviewVisualDimensions } from './WhiteboardVisualsDimensions';

type ExcalidrawUtils = {
  exportToCanvas: typeof ExcalidrawExportToCanvas;
};

/**
 * Maximum dimension (width or height) for generated whiteboard preview images.
 * The maximum depends on the browser, computer memory, and other factors.
 * This value has been chosen as a reasonable compromise to avoid crashes in most cases and avoid pixellation.
 */
export const MAX_DIMENSION = 12000;

/**
 * Generates the preview of the image calling Excalidraw's exportToCanvas function
 * @param excalidrawAPI
 * @param exportScale Multiplier applied to the natural export resolution. The scene is vector, so
 *   exporting at a higher scale re-renders it crisply instead of upscaling a raster — used to keep
 *   small crop regions sharp. Clamped per-axis so neither dimension exceeds `MAX_DIMENSION`.
 * @returns
 */
const getWhiteboardPreviewImage = async (
  excalidrawAPI: ExcalidrawImperativeAPI,
  exportScale: number = 1
): Promise<{ image: HTMLCanvasElement; error: boolean }> => {
  const appState = excalidrawAPI.getAppState(),
    elements = excalidrawAPI.getSceneElements(),
    files = excalidrawAPI.getFiles();

  const getBaseDimensions = (width: number, height: number) => {
    // Handle edge case of zero-dimension whiteboards
    if (width <= 0 || height <= 0) {
      return {
        width: WhiteboardPreviewVisualDimensions.minWidth,
        height: WhiteboardPreviewVisualDimensions.minHeight,
        scale: 1,
      };
    }

    // Handle small images - scale up to at least meet minimum dimensions
    if (width <= WhiteboardPreviewVisualDimensions.minWidth || height <= WhiteboardPreviewVisualDimensions.minHeight) {
      const scale = Math.ceil(
        Math.max(
          WhiteboardPreviewVisualDimensions.minWidth / width,
          WhiteboardPreviewVisualDimensions.minHeight / height
        )
      );
      return {
        width: width * scale,
        height: height * scale,
        scale,
      };
    }

    const maxInputDimension = Math.max(width, height);
    // For mid-size whiteboards just export at original size
    if (maxInputDimension <= MAX_DIMENSION) {
      return {
        width,
        height,
        scale: 1,
      };
    }

    // Discrete scale steps - ordered from largest to smallest
    const SCALE_STEPS = [0.75, 0.5, 0.25, 0.1, 0.05];
    // For normal/large images - find the largest scale that keeps dimensions under MAX_DIMENSION
    for (const scale of SCALE_STEPS) {
      const scaledMax = maxInputDimension * scale;
      if (scaledMax <= MAX_DIMENSION) {
        return {
          width: width * scale,
          height: height * scale,
          scale,
        };
      }
    }

    // Fallback for extremely large images - use smallest scale step and crop
    const smallestScale = SCALE_STEPS[SCALE_STEPS.length - 1];
    return {
      width: Math.min(width * smallestScale, MAX_DIMENSION),
      height: Math.min(height * smallestScale, MAX_DIMENSION),
      scale: smallestScale,
    };
  };

  const getDimensions = (width: number, height: number) => {
    const base = getBaseDimensions(width, height);
    if (exportScale <= 1) {
      return base;
    }
    // Re-render at higher resolution, but never let either axis cross MAX_DIMENSION.
    const maxScale = MAX_DIMENSION / Math.max(base.width, base.height);
    const appliedScale = Math.max(1, Math.min(exportScale, maxScale));
    return {
      width: base.width * appliedScale,
      height: base.height * appliedScale,
      scale: base.scale * appliedScale,
    };
  };

  const { exportToCanvas } = await lazyImportWithErrorHandler<ExcalidrawUtils>(() => import('@alkemio/excalidraw'));
  let errorGenerating = false;

  const canvas = await exportToCanvas({
    appState,
    elements,
    files: files ?? null,
    getDimensions,
    exportPadding: 10,
  })
    .then(canvas => {
      return padImage(canvas, WhiteboardPreviewVisualDimensions.aspectRatio);
    })
    .catch(error => {
      errorGenerating = true;
      logError(error);
      return createFallbackWhiteboardPreview();
    });

  return {
    image: canvas,
    error: errorGenerating,
  };
};

export default getWhiteboardPreviewImage;
