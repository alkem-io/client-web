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
