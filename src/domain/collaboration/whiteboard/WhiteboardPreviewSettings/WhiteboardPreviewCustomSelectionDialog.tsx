import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid, { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import { Box, Button, DialogActions, DialogContent, Divider } from '@mui/material';
import { WhiteboardPreviewSettingsIcon } from './icons/WhiteboardPreviewIcons';
import { useTranslation } from 'react-i18next';
import { Check, Close, Replay } from '@mui/icons-material';
import Loading from '@/core/ui/loading/Loading';
import ReactCrop, { Crop } from 'react-image-crop';
import { useCallback, useEffect, useRef, useState } from 'react';
import { WhiteboardPreviewVisualDimensions } from '../WhiteboardVisuals/WhiteboardVisualsDimensions';
import { PreviewImageDimensions } from '../WhiteboardVisuals/WhiteboardPreviewImagesModels';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { CropConfig } from '@/core/utils/images/cropImage';
import { getDefaultCropConfigForWhiteboardPreview } from '../WhiteboardVisuals/utils/getDefaultCropConfigForWhiteboardPreview';
import validateCropConfig from '../WhiteboardVisuals/utils/validateCropConfig';

interface WhiteboardPreviewCustomSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  whiteboardPreviewImage: Blob | undefined;
  cropConfig?: CropConfig;
  constraints?: PreviewImageDimensions;
  onCropSave: (newCrop: CropConfig) => void;
}

const MINIMUM_SELECTION_SIZE = 0.05; // 5% of the image width

const translateCropConfig = ({
  cropConfig,
  img,
  inverse,
}: {
  cropConfig: CropConfig | undefined;
  img: { width: number; height: number; naturalWidth: number; naturalHeight: number } | null;
  inverse?: boolean;
}): CropConfig | undefined => {
  if (!cropConfig || !img) {
    return undefined;
  }
  const translationX = inverse ? img.width / img.naturalWidth : img.naturalWidth / img.width;
  const translationY = inverse ? img.height / img.naturalHeight : img.naturalHeight / img.height;
  return {
    x: cropConfig.x * translationX,
    y: cropConfig.y * translationY,
    width: cropConfig.width * translationX,
    height: cropConfig.height * translationY,
  };
};

const WhiteboardPreviewCustomSelectionDialog = ({
  open,
  onClose,
  onCropSave,
  whiteboardPreviewImage,
  cropConfig,
  constraints = WhiteboardPreviewVisualDimensions,
}: WhiteboardPreviewCustomSelectionDialogProps) => {
  const { t } = useTranslation();
  const ensurePresence = useEnsurePresence();
  const imgRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);

  const { aspectRatio } = constraints;
  const [crop, setCrop] = useState<Crop | undefined>(undefined);
  const onCropChange = (crop: CropConfig) => {
    /**
     * Note: Our CropConfigs have only the coordinates width and height,
     * ReactCrop type allows percentage units or pixels, we force px units here.
     */
    setCrop({
      x: crop.x,
      y: crop.y,
      width: crop.width,
      height: crop.height,
      unit: 'px',
    });
  };

  const resetCrop = () => {
    const img = ensurePresence(imgRef.current);
    const crop = getDefaultCropConfigForWhiteboardPreview(img.width, img.height, aspectRatio);
    onCropChange(crop);
  };

  const onLoad = useCallback(
    (img: HTMLImageElement) => {
      imgRef.current = img;
      setReady(true);
      const currentCropConfig = translateCropConfig({
        cropConfig,
        img,
        inverse: true,
      });
      if (validateCropConfig(currentCropConfig, aspectRatio, img)) {
        onCropChange(currentCropConfig!);
      } else {
        resetCrop(); // If no valid crop config, reset to default:
      }
    },
    [aspectRatio, setCrop, cropConfig]
  );

  const handleConfirmCrop = () => {
    const cropConfig = ensurePresence(crop);
    const img = ensurePresence(imgRef.current);
    // Translate crop to the real generated image dimensions:
    const translatedCrop = translateCropConfig({ cropConfig, img, inverse: false });
    onCropSave(translatedCrop!); // translatedCrop is guaranteed by the ensurePresence cropConfig and img
  };

  const [imageObjectUrl, setImageObjectUrl] = useState<string>();
  useEffect(() => {
    if (open && whiteboardPreviewImage) {
      const objectUrl = URL.createObjectURL(whiteboardPreviewImage);
      setImageObjectUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [open, whiteboardPreviewImage]);

  return (
    <DialogWithGrid open={open} onClose={onClose} fullWidth>
      <DialogHeader
        title={t('pages.whiteboard.previewSettings.modes.custom.title')}
        onClose={onClose}
        icon={<WhiteboardPreviewSettingsIcon />}
      />
      <DialogContent sx={{ userSelect: 'none' }}>
        {!whiteboardPreviewImage && <Loading />}
        {whiteboardPreviewImage && (
          <Box>
            <ReactCrop
              aspect={aspectRatio}
              minWidth={imgRef.current?.width ? imgRef.current.width * MINIMUM_SELECTION_SIZE : undefined}
              crop={crop}
              onChange={onCropChange}
              keepSelection
            >
              <img
                src={imageObjectUrl}
                crossOrigin="anonymous"
                alt={t('pages.whiteboard.previewSettings.cropDialog.previewArea')}
                onLoad={event => onLoad(event.target as HTMLImageElement)}
              />
            </ReactCrop>
          </Box>
        )}
      </DialogContent>
      <DialogFooter>
        <Box>
          <pre>
            //!! Img:
            {JSON.stringify({
              width: imgRef.current?.width,
              naturalWidth: imgRef.current?.naturalWidth,
              height: imgRef.current?.height,
              naturalHeight: imgRef.current?.naturalHeight,
            })}
            <br />
            Crop:{JSON.stringify(crop)}
            <br />
            TCrop:
            {JSON.stringify(
              translateCropConfig({
                cropConfig: crop,
                img: imgRef.current,
                inverse: false,
              })
            )}
          </pre>
        </Box>
        <DialogActions>
          <Button variant="outlined" startIcon={<Replay />} onClick={resetCrop} disabled={!ready}>
            {t('pages.whiteboard.previewSettings.cropDialog.reset')}
          </Button>
          <Divider orientation="vertical" flexItem />
          <Button variant="outlined" startIcon={<Close />} onClick={onClose}>
            {t('pages.whiteboard.previewSettings.cropDialog.cancel')}
          </Button>
          <Button variant="contained" startIcon={<Check />} onClick={handleConfirmCrop} disabled={!ready}>
            {t('pages.whiteboard.previewSettings.cropDialog.confirm')}
          </Button>
        </DialogActions>
      </DialogFooter>
    </DialogWithGrid>
  );
};

export default WhiteboardPreviewCustomSelectionDialog;
