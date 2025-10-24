import { VisualType, WhiteboardPreviewMode } from '@/core/apollo/generated/graphql-schema';
import { WhiteboardPreviewSettings } from '../WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { getDefaultCropConfigForWhiteboardPreview } from './utils/getDefaultCropConfigForWhiteboardPreview';
import { CardVisualDimensions, WhiteboardPreviewVisualDimensions } from './WhiteboardVisualsDimensions';
import cropImage from '@/core/utils/images/cropImage';
import getWhiteboardPreviewImage from './getWhiteboardPreviewImage';
import { PreviewImageDimensions, WhiteboardPreviewImage } from './WhiteboardPreviewImagesModels';
import cropImageWithConstraints from '../../../../core/utils/images/cropImageWithConstraints';

interface WhiteboardWithPreviewImageDimensions {
  profile?: {
    preview?: PreviewImageDimensions;
    visual?: PreviewImageDimensions;
  };
  previewSettings: WhiteboardPreviewSettings;
}

export const generateWhiteboardVisuals = async <Whiteboard extends WhiteboardWithPreviewImageDimensions>(
  whiteboard: Whiteboard,
  excalidrawAPI?: ExcalidrawImperativeAPI | null,
  force: boolean = false
): Promise<WhiteboardPreviewImage[] | undefined> => {
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

  const cardPreview = await cropImage(whiteboardPreview, cropImageWithConstraints(CardVisualDimensions));

  previewImages.push({
    visualType: VisualType.WhiteboardPreview,
    imageData: whiteboardPreview,
  });
  previewImages.push({
    visualType: VisualType.Card,
    imageData: cardPreview,
  });

  return previewImages;
};
