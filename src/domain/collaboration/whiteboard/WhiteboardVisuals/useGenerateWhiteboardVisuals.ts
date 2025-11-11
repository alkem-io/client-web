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
import { error as logError } from '@/core/logging/sentry/log';
import { useTranslation } from 'react-i18next';

interface WhiteboardWithPreviewImageDimensions {
  profile?: {
    preview?: PreviewImageDimensions;
    visual?: PreviewImageDimensions;
  };
  previewSettings: WhiteboardPreviewSettings;
}

interface VisualRequest {
  visualType: VisualType;
  dimensions: PreviewImageDimensions;
}

const DefaultVisualsRequested: VisualRequest[] = [
  // By default, generate both a whiteboard preview and a card preview
  {
    visualType: VisualType.WhiteboardPreview,
    dimensions: WhiteboardPreviewVisualDimensions,
  },
  {
    visualType: VisualType.Card,
    dimensions: CardVisualDimensions,
  },
] as const;

const useGenerateWhiteboardVisuals = (excalidrawAPI?: ExcalidrawImperativeAPI | null) => {
  const { t } = useTranslation();
  const notify = useNotification();

  const generateWhiteboardVisuals = async <Whiteboard extends WhiteboardWithPreviewImageDimensions>(
    whiteboard: Whiteboard,
    force: boolean = false,
    /**
     * Always put the biggest visual first in the array, as the rest will be crops of it
     */
    visualsRequested: VisualRequest[] = DefaultVisualsRequested
  ): Promise<WhiteboardPreviewImage[] | undefined> => {
    if (!excalidrawAPI || !whiteboard) {
      return;
    }
    if (visualsRequested.length === 0) {
      return;
    }
    // Skip generation if not forced and mode is Fixed
    if (!force && whiteboard?.previewSettings.mode === WhiteboardPreviewMode.Fixed) {
      return;
    }

    const previewImages: WhiteboardPreviewImage[] = [];

    const { image, error } = await getWhiteboardPreviewImage(excalidrawAPI);
    if (error || !image) {
      // If there was an error generating the preview, just return to avoid overwriting existing previews
      logError(new Error('Error generating whiteboard preview image.'));
      notify(t('pages.whiteboard.preview.errorGeneratingPreview'), 'error');
      return;
    }

    const [originalPreviewSettings, ...restPreviewsSettings] = visualsRequested;

    let cropConfig: CropConfig | undefined;
    if (
      whiteboard.previewSettings.mode !== WhiteboardPreviewMode.Auto &&
      validateCropConfig(whiteboard.previewSettings.coordinates, originalPreviewSettings.dimensions.aspectRatio, image)
    ) {
      cropConfig = whiteboard.previewSettings.coordinates;
    } else {
      cropConfig = getDefaultCropConfigForWhiteboardPreview(
        image.width,
        image.height,
        originalPreviewSettings.dimensions.aspectRatio
      );
    }

    const originalPreview = resizeImage(cropImage(image, cropConfig), originalPreviewSettings.dimensions);
    const originalPreviewBlob = await toBlobPromise(originalPreview, { type: 'image/png' }).catch(ex => {
      logError(new Error('Error generating whiteboard preview image blob.', { cause: ex }));
      notify(t('pages.whiteboard.preview.errorGeneratingPreview'), 'error');
      return null;
    });
    if (originalPreviewBlob) {
      previewImages.push({
        visualType: originalPreviewSettings.visualType,
        imageData: originalPreviewBlob,
      });
    }

    for (const previewSetting of restPreviewsSettings) {
      // Generate cropped/resized versions for the rest of the requested visuals
      const preview = resizeImage(originalPreview, previewSetting.dimensions);
      const previewBlob = await toBlobPromise(preview, { type: 'image/png' }).catch(ex => {
        logError(new Error(`Error generating ${previewSetting.visualType} image blob.`, { cause: ex }));
        notify(t('pages.whiteboard.preview.errorGeneratingPreview'), 'error');
        return null;
      });
      if (previewBlob) {
        previewImages.push({
          visualType: previewSetting.visualType,
          imageData: previewBlob,
        });
      }
    }

    return previewImages;
  };
  return { generateWhiteboardVisuals };
};

export default useGenerateWhiteboardVisuals;
