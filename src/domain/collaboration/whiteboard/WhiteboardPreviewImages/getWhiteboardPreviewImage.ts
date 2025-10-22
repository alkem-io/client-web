import { lazyImportWithErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import type { exportToBlob as ExcalidrawExportToBlob } from '@excalidraw/utils';
import { PreviewImageDimensions } from './WhiteboardPreviewImages';
import { WhiteboardPreviewVisualDimensions } from './WhiteboardDimensions';
import cropImage, { CropConfigFunction } from '@/core/utils/images/cropImage';

type ExcalidrawUtils = {
  exportToBlob: typeof ExcalidrawExportToBlob;
};

const getWhiteboardPreviewImage = async (
  excalidrawAPI: ExcalidrawImperativeAPI,
  desiredDimensions: PreviewImageDimensions = WhiteboardPreviewVisualDimensions,
  crop?: CropConfigFunction
): Promise<Blob> => {
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

  const exportPadding = Math.max(maxX - minX, maxY - minY) * 0.2; // 20% of the biggest dimension as padding

  const getDimensions = (width: number, height: number) => {
    if (desiredDimensions.minWidth > width) {
      width = desiredDimensions.minWidth;
    }
    if (desiredDimensions.minHeight > height) {
      height = desiredDimensions.minHeight;
    }
    return {
      width,
      height,
      scale: 1,
    };
  };

  const { exportToBlob } = await lazyImportWithErrorHandler<ExcalidrawUtils>(() => import('@alkemio/excalidraw'));

  const blob = exportToBlob({
    appState,
    elements,
    files: files ?? null,
    getDimensions,
    mimeType: 'image/png',
    exportPadding,
  });

  if (crop) {
    return cropImage(await blob, crop);
  } else {
    return blob;
  }
};

export default getWhiteboardPreviewImage;
