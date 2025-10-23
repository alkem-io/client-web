import { lazyImportWithErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import type { exportToBlob as ExcalidrawExportToBlob } from '@excalidraw/utils';
import { PreviewImageDimensions } from '../model/WhiteboardPreviewImagesModels';
import { WhiteboardPreviewVisualDimensions } from '../WhiteboardDimensions';
import cropImage, { CropConfigFunction } from '@/core/utils/images/cropImage';
import resizeImage from '@/core/utils/images/resizeImage';
import { error as logError } from '@/core/logging/sentry/log';
import createFallbackWhiteboardPreview from './createFallbackWhiteboardPreview';

const EXPORT_PADDING = 0.2; // 20% padding of the biggest dimension as padding

type ExcalidrawUtils = {
  exportToBlob: typeof ExcalidrawExportToBlob;
};

/**
 * Generates the preview of the image calling Excalidraw's exportToBlob function
 * @param excalidrawAPI
 * @param desiredDimensions Desired dimensions for the preview image
 * @param crop Function to get CropConfig given resulting preview image dimensions
 * @returns
 */
const getWhiteboardPreviewImage = async (
  excalidrawAPI: ExcalidrawImperativeAPI,
  desiredDimensions: PreviewImageDimensions = WhiteboardPreviewVisualDimensions,
  crop?: CropConfigFunction
): Promise<{ image: Blob; error: boolean }> => {
  const log = (..._args) => {
    // console.log('[getWhiteboardPreviewImage]', ..._args);
  };

  const appState = excalidrawAPI.getAppState(),
    elements = excalidrawAPI.getSceneElements(),
    files = excalidrawAPI.getFiles();

  // Calculate the bounding box of all elements
  const { minX, minY, maxX, maxY } = elements.reduce(
    (acc, element) => ({
      minX: Math.min(acc.minX, element.x),
      minY: Math.min(acc.minY, element.y),
      maxX: Math.max(acc.maxX, element.x + element.width),
      maxY: Math.max(acc.maxY, element.y + element.height),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );

  const exportPadding = Math.max(maxX - minX, maxY - minY) * EXPORT_PADDING;

  const getDimensions = (width: number, height: number) => {
    log('Original image dimensions:', { width, height });

    if (width <= desiredDimensions.minWidth || height <= desiredDimensions.minHeight) {
      log('image is smaller than min dimensions, exporting at 3x scale');
      return {
        width: desiredDimensions.minWidth * 2,
        height: desiredDimensions.minHeight * 2,
        scale: 2,
      };
    }
    log('Exporting image with dimensions:', { width, height });
    return {
      width: width,
      height: height,
      scale: 1,
    };
  };

  const { exportToBlob } = await lazyImportWithErrorHandler<ExcalidrawUtils>(() => import('@alkemio/excalidraw'));
  let errorGenerating = false;

  // Generates the preview with the full size, then resizes and crops if needed
  const blob = await exportToBlob({
    appState,
    elements,
    files: files ?? null,
    getDimensions,
    mimeType: 'image/png',
    exportPadding,
  })
    .then(blob =>
      resizeImage(blob, (imageWidth, imageHeight) => ({
        width: Math.min(imageWidth, desiredDimensions.maxWidth),
        height: Math.min(imageHeight, desiredDimensions.maxHeight),
        keepRatio: true,
      }))
    )
    .catch(error => {
      errorGenerating = true;
      logError(error);
      return createFallbackWhiteboardPreview(desiredDimensions.maxWidth, desiredDimensions.maxHeight);
    });

  if (crop) {
    return {
      image: await cropImage(blob, crop),
      error: errorGenerating,
    };
  } else {
    return { image: blob, error: errorGenerating };
  }
};

export default getWhiteboardPreviewImage;
