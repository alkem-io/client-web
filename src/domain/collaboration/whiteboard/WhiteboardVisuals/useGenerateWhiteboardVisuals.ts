import type { ExcalidrawImperativeAPI } from '@excalidraw-yjs/excalidraw/dist/types/excalidraw/types';
import { useTranslation } from 'react-i18next';
import { VisualType, WhiteboardPreviewMode } from '@/core/apollo/generated/graphql-schema';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import cropImage, { type CropConfig } from '@/core/utils/images/cropImage';
import resizeImage from '@/core/utils/images/resizeImage';
import { toBlobPromise } from '@/core/utils/images/toBlobPromise';
import type { WhiteboardPreviewSettings } from '../WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import getWhiteboardPreviewImage, { MAX_DIMENSION } from './getWhiteboardPreviewImage';
import { getDefaultCropConfigForWhiteboardPreview } from './utils/getDefaultCropConfigForWhiteboardPreview';
import validateCropConfig from './utils/validateCropConfig';
import type { PreviewImageDimensions, WhiteboardPreviewImage } from './WhiteboardPreviewImagesModels';
import { CardVisualDimensions, WhiteboardPreviewVisualDimensions } from './WhiteboardVisualsDimensions';

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

    // The scene is exported at scale 1 (1px per Excalidraw unit), so a small crop region is a small
    // raster that resizeImage would have to upscale → pixelation. Excalidraw is vector, so re-render
    // the scene at a higher scale such that the crop natively meets the target width, then crop that.
    //
    // Carefully bounded: the re-render is the whole scene scaled up, and Chromium silently fails to
    // produce canvases beyond ~10-12k px per axis. So we never let the re-render exceed MAX_DIMENSION
    // (shared with the base export pipeline), and we skip it entirely when the scale-1 canvas is
    // already that large (huge whiteboards) — that path is unchanged and never gets a second, bigger export.
    let workingImage = image;
    let workingCrop = cropConfig;
    if (cropConfig && cropConfig.width > 0) {
      const currentMaxDimension = Math.max(image.width, image.height);
      const maxAchievableScale = MAX_DIMENSION / currentMaxDimension;
      const desiredScale = originalPreviewSettings.dimensions.maxWidth / cropConfig.width;
      const effectiveScale = Math.min(desiredScale, maxAchievableScale);
      if (effectiveScale > 1.05) {
        const { image: hiResImage, error: hiResError } = await getWhiteboardPreviewImage(excalidrawAPI, effectiveScale);
        if (!hiResError && hiResImage) {
          // padImage scales proportionally, so the achieved scale is just the width ratio.
          const achievedScale = hiResImage.width / image.width;
          workingImage = hiResImage;
          workingCrop = {
            x: cropConfig.x * achievedScale,
            y: cropConfig.y * achievedScale,
            width: cropConfig.width * achievedScale,
            height: cropConfig.height * achievedScale,
          };
        }
      }
    }

    const originalPreview = resizeImage(cropImage(workingImage, workingCrop), originalPreviewSettings.dimensions);
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
