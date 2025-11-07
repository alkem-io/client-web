import { lazyImportWithErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import type { exportToCanvas as ExcalidrawExportToCanvas } from '@alkemio/excalidraw/dist/types/utils/src/export';
import { WhiteboardPreviewVisualDimensions } from './WhiteboardVisualsDimensions';
import { error as logError } from '@/core/logging/sentry/log';
import createFallbackWhiteboardPreview from './createFallbackWhiteboardPreview';

const EXPORT_PADDING = 0.1; // 10% padding of the biggest dimension as padding

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

  // Calculate the bounding box of all elements
  const exportPadding = (elements => {
    if (elements.length === 0) {
      return 0;
    } else {
      const { minX, minY, maxX, maxY } = elements.reduce(
        (acc, element) => ({
          minX: Math.min(acc.minX, element.x),
          minY: Math.min(acc.minY, element.y),
          maxX: Math.max(acc.maxX, element.x + element.width),
          maxY: Math.max(acc.maxY, element.y + element.height),
        }),
        { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
      );
      return Math.max(maxX - minX, maxY - minY) * EXPORT_PADDING;
    }
  })(elements);

  const getDimensions = (width: number, height: number) => {
    if (width <= WhiteboardPreviewVisualDimensions.minWidth || height <= WhiteboardPreviewVisualDimensions.minHeight) {
      return {
        width: Math.max(WhiteboardPreviewVisualDimensions.minWidth * 2, width * 2),
        height: Math.max(WhiteboardPreviewVisualDimensions.minHeight * 2, height * 2),
        scale: 2,
      };
    }
    return {
      width: width,
      height: height,
      scale: 1,
    };
  };

  const { exportToCanvas } = await lazyImportWithErrorHandler<ExcalidrawUtils>(() => import('@alkemio/excalidraw'));
  let errorGenerating = false;

  const canvas = await exportToCanvas({
    appState,
    elements,
    files: files ?? null,
    getDimensions,
    exportPadding,
  }).catch(error => {
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
