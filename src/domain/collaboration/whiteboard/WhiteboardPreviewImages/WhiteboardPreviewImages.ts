import { VisualType, WhiteboardPreviewMode } from '@/core/apollo/generated/graphql-schema';
import { useUploadVisualMutation } from '@/core/apollo/generated/apollo-hooks';
import { WhiteboardPreviewSettings } from './WhiteboardPreviewSettings';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { getDefaultCropConfigForWhiteboardPreview } from './utils/getDefaultCropConfigForWhiteboardPreview';
import { CardVisualDimensions, WhiteboardPreviewVisualDimensions } from './WhiteboardDimensions';
import cropImage from '@/core/utils/images/cropImage';
import getWhiteboardPreviewImage from './utils/getWhiteboardPreviewImage';

export interface PreviewImageDimensions {
  maxWidth: number;
  maxHeight: number;
  minWidth: number;
  minHeight: number;
  aspectRatio: number;
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
  excalidrawAPI?: ExcalidrawImperativeAPI | null,
  force: boolean = false
) => {
  if (!excalidrawAPI || !whiteboard) {
    return;
  }
  // Skip generation if not forced and mode is Fixed
  if (!force && whiteboard?.previewSettings.mode === WhiteboardPreviewMode.Fixed) {
    return;
  }

  const calculateCropConfig = (imageWidth: number, imageHeight: number) => {
    if (whiteboard.previewSettings.mode !== WhiteboardPreviewMode.Auto && whiteboard.previewSettings.coordinates) {
      return whiteboard.previewSettings.coordinates;
    } else {
      return getDefaultCropConfigForWhiteboardPreview(
        imageWidth,
        imageHeight,
        WhiteboardPreviewVisualDimensions.aspectRatio,
        WhiteboardPreviewVisualDimensions.maxWidth,
        WhiteboardPreviewVisualDimensions.maxHeight
      );
    }
  };

  const previewImages: WhiteboardPreviewImage[] = [];

  const { image: whiteboardPreview, error } = await getWhiteboardPreviewImage(
    excalidrawAPI,
    whiteboard?.profile?.preview,
    calculateCropConfig
  );
  if (error) {
    // If there was an error generating the preview, just return an empty array to avoid overwriting existing previews
    return previewImages;
  }

  const cardPreview = await cropImage(whiteboardPreview, () => ({
    width: CardVisualDimensions.maxWidth,
    height: CardVisualDimensions.maxHeight,
    x: 0,
    y: 0,
  }));

  previewImages.push({
    visualType: VisualType.WhiteboardPreview,
    imageData: whiteboardPreview,
  });
  previewImages.push({
    visualType: VisualType.Card, //!!
    imageData: cardPreview,
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
        const previewImage = previewImages?.find(pi => pi.visualType === VisualType.WhiteboardPreview);
        if (previewImage) {
          await uploadVisual({
            variables: {
              file: new File([previewImage.imageData], `/Whiteboard-${whiteboardNameId}-whiteboard-preview.png`, {
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
