import { lazyImportWithErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import type { exportToBlob as ExcalidrawExportToBlob } from '@excalidraw/utils';

type ExcalidrawGetDimensionsFunction = (
  width: number,
  height: number
) => {
  width: number;
  height: number;
  scale?: number;
};

type ExcalidrawUtils = {
  exportToBlob: typeof ExcalidrawExportToBlob;
};

const getWhiteboardPreviewImage = async (
  excalidrawAPI: ExcalidrawImperativeAPI,
  opts: {
    mimeType?: string;
    quality?: number;
    exportPadding?: number;
  } = {
    mimeType: 'image/png',
  },
  getDimensions?: ExcalidrawGetDimensionsFunction
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

  if (typeof opts.exportPadding === 'undefined') {
    opts.exportPadding = Math.max(maxX - minX, maxY - minY) * 0.2; // 20% of the biggest dimension as padding
  }

  const { exportToBlob } = await lazyImportWithErrorHandler<ExcalidrawUtils>(() => import('@alkemio/excalidraw'));

  return exportToBlob({
    appState,
    elements,
    files: files ?? null,
    getDimensions,
    ...opts,
  });
};

export default getWhiteboardPreviewImage;
