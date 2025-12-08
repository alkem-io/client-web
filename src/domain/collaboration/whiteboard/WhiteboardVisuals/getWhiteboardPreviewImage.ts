import { lazyImportWithErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import type { exportToCanvas as ExcalidrawExportToCanvas } from '@alkemio/excalidraw/dist/types/utils/src/export';
import { WhiteboardPreviewVisualDimensions } from './WhiteboardVisualsDimensions';
import { error as logError } from '@/core/logging/sentry/log';
import createFallbackWhiteboardPreview from './createFallbackWhiteboardPreview';
import { padImage } from '@/core/utils/images/padImage';

type ExcalidrawUtils = {
  exportToCanvas: typeof ExcalidrawExportToCanvas;
};

/**
 * Generates the preview of the image calling Excalidraw's exportToCanvas function
 * @param excalidrawAPI
 * @param desiredDimensions Desired dimensions for the preview image
 * @param crop Function to get CropConfig given resulting preview image dimensions
 * @returns
 */
const getWhiteboardPreviewImage = async (
  excalidrawAPI: ExcalidrawImperativeAPI
): Promise<{ image: HTMLCanvasElement; error: boolean }> => {
  const appState = excalidrawAPI.getAppState(),
    elements = excalidrawAPI.getSceneElements(),
    files = excalidrawAPI.getFiles();

  const getDimensions = (width: number, height: number) => {
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

    const MAX_DIMENSION = 12000;
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
