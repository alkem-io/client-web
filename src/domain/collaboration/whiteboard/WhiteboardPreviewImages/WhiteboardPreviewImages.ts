import getWhiteboardPreviewDimensions from './getWhiteboardPreviewDimensions';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { useUploadVisualMutation } from '@/core/apollo/generated/apollo-hooks';
import { BannerDimensions, BannerNarrowDimensions } from './WhiteboardDimensions';
import { WhiteboardPreviewSettings } from './WhiteboardPreviewSettings';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import getWhiteboardPreviewImage from './getWhiteboardPreviewImage';

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
  excalidrawAPI?: ExcalidrawImperativeAPI | null
) => {
  if (!excalidrawAPI) {
    return;
  }

  const previewImages: WhiteboardPreviewImage[] = [];

  previewImages.push({
    visualType: VisualType.Banner,
    imageData: await getWhiteboardPreviewImage(
      excalidrawAPI,
      { mimeType: 'image/png' },
      getWhiteboardPreviewDimensions(whiteboard?.profile?.preview ?? BannerDimensions)
    ),
  });

  previewImages.push({
    visualType: VisualType.Card,
    imageData: await getWhiteboardPreviewImage(
      excalidrawAPI,
      { mimeType: 'image/png' },
      getWhiteboardPreviewDimensions(whiteboard?.profile?.visual ?? BannerNarrowDimensions)
    ),
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
