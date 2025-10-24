import { VisualType, WhiteboardPreviewMode } from '@/core/apollo/generated/graphql-schema';
import { WhiteboardPreviewSettings } from '../WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { getDefaultCropConfigForWhiteboardPreview } from './utils/getDefaultCropConfigForWhiteboardPreview';
import { CardVisualDimensions, WhiteboardPreviewVisualDimensions } from './WhiteboardVisualsDimensions';
import cropImage, { CropConfig } from '@/core/utils/images/cropImage';
import getWhiteboardPreviewImage from './getWhiteboardPreviewImage';
import { PreviewImageDimensions, WhiteboardPreviewImage } from './WhiteboardPreviewImagesModels';
import { toBlobPromise } from '@/core/utils/images/toBlobPromise';
import { useNotification } from '@/core/ui/notifications/useNotification';
import validateCropConfig from './utils/validateCropConfig';
import resizeImage from '@/core/utils/images/resizeImage';

interface WhiteboardWithPreviewImageDimensions {
  profile?: {
    preview?: PreviewImageDimensions;
    visual?: PreviewImageDimensions;
  };
  previewSettings: WhiteboardPreviewSettings;
}
const useGenerateWhiteboardVisuals = (excalidrawAPI?: ExcalidrawImperativeAPI | null) => {
  const notify = useNotification();

  const generateWhiteboardVisuals = async <Whiteboard extends WhiteboardWithPreviewImageDimensions>(
    whiteboard: Whiteboard,
    force: boolean = false
  ): Promise<WhiteboardPreviewImage[] | undefined> => {
    if (!excalidrawAPI || !whiteboard) {
      return;
    }
    // Skip generation if not forced and mode is Fixed
    if (!force && whiteboard?.previewSettings.mode === WhiteboardPreviewMode.Fixed) {
      return;
    }

    const previewImages: WhiteboardPreviewImage[] = [];

    const { image, error } = await getWhiteboardPreviewImage(excalidrawAPI);
    if (error) {
      // If there was an error generating the preview, just return to avoid overwriting existing previews
      notify('Error generating whiteboard preview image. Using existing previews if available.', 'error');
      return;
    }

    let cropConfig: CropConfig | undefined;
    if (
      whiteboard.previewSettings.mode !== WhiteboardPreviewMode.Auto &&
      validateCropConfig(whiteboard.previewSettings.coordinates, WhiteboardPreviewVisualDimensions.aspectRatio, image)
    ) {
      cropConfig = whiteboard.previewSettings.coordinates;
    } else {
      cropConfig = getDefaultCropConfigForWhiteboardPreview(
        image.width,
        image.height,
        WhiteboardPreviewVisualDimensions.aspectRatio
      );
    }

    const whiteboardPreview = resizeImage(cropImage(image, cropConfig), WhiteboardPreviewVisualDimensions);
    const cardPreview = resizeImage(whiteboardPreview, CardVisualDimensions);

    previewImages.push({
      visualType: VisualType.WhiteboardPreview,
      imageData: await toBlobPromise(whiteboardPreview, { type: 'image/png' }),
    });
    previewImages.push({
      visualType: VisualType.Card,
      imageData: await toBlobPromise(cardPreview, { type: 'image/png' }),
    });

    return previewImages;
  };
  return { generateWhiteboardVisuals };
};

export default useGenerateWhiteboardVisuals;
