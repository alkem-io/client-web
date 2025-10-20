import type { ExportedDataState } from '@alkemio/excalidraw/dist/types/excalidraw/data/types';
import getWhiteboardPreviewDimensions from './getWhiteboardPreviewDimensions';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { useUploadVisualMutation } from '@/core/apollo/generated/apollo-hooks';
import { BannerDimensions, BannerNarrowDimensions } from './WhiteboardDimensions';
import type { exportToBlob as ExcalidrawExportToBlob } from '@alkemio/excalidraw';
import { lazyImportWithErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { WhiteboardPreviewSettings } from './WhiteboardPreviewSettings';

type RelevantExcalidrawState = Pick<ExportedDataState, 'appState' | 'elements' | 'files'>;

type ExcalidrawUtils = {
  exportToBlob: typeof ExcalidrawExportToBlob;
};

export interface PreviewImageDimensions {
  maxWidth: number;
  maxHeight: number;
  minWidth: number;
  minHeight: number;
  minScale?: number;
}

export interface WhiteboardPreviewImage {
  // CARD => bannerNarrow for cards, BANNER => Big preview for SingleWhiteboardCallouts
  visualType: VisualType;
  imageData: Blob;
}

export interface VisualsIds {
  cardVisualId?: string;
  previewVisualId?: string;
}

interface WhiteboardWithPreviewImageDimensions {
  profile?: {
    preview?: PreviewImageDimensions;
    visual?: PreviewImageDimensions;
  };
  previewSettings: WhiteboardPreviewSettings;
}

export const generateWhiteboardPreviewImages = async <Whiteboard extends WhiteboardWithPreviewImageDimensions>(
  whiteboard: Whiteboard,
  excalidrawState: RelevantExcalidrawState | undefined
) => {
  if (!excalidrawState) {
    return;
  }
  const { appState, elements, files } = excalidrawState;

  const previewImages: WhiteboardPreviewImage[] = [];

  const { exportToBlob } = await lazyImportWithErrorHandler<ExcalidrawUtils>(() => import('@alkemio/excalidraw'));

  previewImages.push({
    visualType: VisualType.Banner,
    imageData: await exportToBlob({
      appState,
      elements,
      files: files ?? null,
      getDimensions: getWhiteboardPreviewDimensions(whiteboard?.profile?.preview ?? BannerDimensions),
      mimeType: 'image/png',
    }),
  });

  previewImages.push({
    visualType: VisualType.Card,
    imageData: await exportToBlob({
      appState,
      elements,
      files: files ?? null,
      getDimensions: getWhiteboardPreviewDimensions(whiteboard?.profile?.visual ?? BannerNarrowDimensions),
      mimeType: 'image/png',
    }),
  });

  return previewImages;
};

/**
 * Receives the images exported by Excalidraw in the code above if there is a visualId to upload them to.
 * @returns
 */
export const useUploadWhiteboardVisuals = () => {
  const [uploadVisual, { loading }] = useUploadVisualMutation({});
  return {
    uploadVisuals: async (
      previewImages: WhiteboardPreviewImage[] | undefined,
      visualsIds: VisualsIds,
      whiteboardNameId: string = 'whiteboard'
    ) => {
      if (visualsIds.cardVisualId) {
        const previewImage = previewImages?.find(pi => pi.visualType === VisualType.Card);
        if (previewImage) {
          await uploadVisual({
            variables: {
              file: new File([previewImage.imageData], `/Whiteboard-${whiteboardNameId}-bannerNarrow.png`, {
                type: 'image/png',
              }),
              uploadData: {
                visualID: visualsIds.cardVisualId,
              },
            },
          });
        }
      }
      if (visualsIds.previewVisualId) {
        const previewImage = previewImages?.find(pi => pi.visualType === VisualType.Banner);
        if (previewImage) {
          await uploadVisual({
            variables: {
              file: new File([previewImage.imageData], `/Whiteboard-${whiteboardNameId}-banner.png`, {
                type: 'image/png',
              }),
              uploadData: {
                visualID: visualsIds.previewVisualId,
              },
            },
          });
        }
      }
    },
    loading,
  };
};
