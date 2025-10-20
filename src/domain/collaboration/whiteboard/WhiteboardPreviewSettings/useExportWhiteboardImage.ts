import type { ExportedDataState } from '@alkemio/excalidraw/dist/types/excalidraw/data/types';
import type { exportToBlob as ExcalidrawExportToBlob } from '@alkemio/excalidraw';
import { lazyImportWithErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';

type RelevantExcalidrawState = Pick<ExportedDataState, 'appState' | 'elements' | 'files'>;

type ExcalidrawUtils = {
  exportToBlob: typeof ExcalidrawExportToBlob;
};

const useExportWhiteboardImage = () => {

  const exportWhiteboardImage = async (
    excalidrawState: RelevantExcalidrawState
  ) => {
    const { appState, elements, files } = excalidrawState;

    //const previewImages: WhiteboardPreviewImage[] = [];

    const { exportToBlob } = await lazyImportWithErrorHandler<ExcalidrawUtils>(() => import('@alkemio/excalidraw'));

    const blob = await exportToBlob({
        appState,
        elements,
        files: files ?? null,
        // getDimensions: getWhiteboardPreviewDimensions(whiteboard?.profile?.preview ?? BannerDimensions),
        mimeType: 'image/png',
      });

    return blob;
  }
  return exportWhiteboardImage;
}

export default useExportWhiteboardImage;