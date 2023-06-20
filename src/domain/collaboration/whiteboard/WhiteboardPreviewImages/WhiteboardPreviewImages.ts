import { ExportedDataState } from '@alkemio/excalidraw/types/data/types';
import { WhiteboardWithValue } from '../containers/WhiteboardValueContainer';
import { exportToBlob } from '@alkemio/excalidraw';
import getWhiteboardPreviewDimensions from './getWhiteboardPreviewDimensions';
import { VisualType } from '../../../../core/apollo/generated/graphql-schema';
import { useUploadVisualMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { BannerDimensions, BannerNarrowDimensions } from './WhiteboardDimensions';

type RelevantExcalidrawState = Pick<ExportedDataState, 'appState' | 'elements' | 'files'>;

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

export const generateWhiteboardPreviewImages = async <Whiteboard extends WhiteboardWithValue>(
  whiteboard: Whiteboard,
  excalidrawState: RelevantExcalidrawState | undefined
) => {
  if (!excalidrawState) {
    return;
  }
  const { appState, elements, files } = excalidrawState;

  const previewImages: WhiteboardPreviewImage[] = [];

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
      whiteboardNameId?: string
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
