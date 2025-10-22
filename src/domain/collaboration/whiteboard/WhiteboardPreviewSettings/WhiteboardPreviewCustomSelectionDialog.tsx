import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid, { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import { Box, Button, DialogActions, DialogContent, Divider } from '@mui/material';
import { WhiteboardPreviewSettingsIcon } from './icons/WhiteboardPreviewIcons';
import { useTranslation } from 'react-i18next';
import { Check, Close, Replay } from '@mui/icons-material';
import Loading from '@/core/ui/loading/Loading';
import ReactCrop, { Crop } from 'react-image-crop';
import { useCallback, useRef, useState } from 'react';
import { WhiteboardPreviewVisualDimensions } from '../WhiteboardPreviewImages/WhiteboardDimensions';
import { PreviewImageDimensions } from '../WhiteboardPreviewImages/WhiteboardPreviewImages';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { CropConfig } from '@/core/utils/images/cropImage';
import { getDefaultCropConfigForWhiteboardPreview } from '../WhiteboardPreviewImages/getDefaultCropConfigForWhiteboardPreview';

interface WhiteboardPreviewCustomSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  whiteboardPreviewImage: string | undefined;
  currentCropConfig?: CropConfig;
  constraints?: PreviewImageDimensions;
  onChangeCrop: (newCrop: CropConfig) => void;
}

const WhiteboardPreviewCustomSelectionDialog = ({
  open,
  onClose,
  onChangeCrop,
  whiteboardPreviewImage,
  currentCropConfig,
  constraints = WhiteboardPreviewVisualDimensions,
}: WhiteboardPreviewCustomSelectionDialogProps) => {
  const { t } = useTranslation();
  const ensurePresence = useEnsurePresence();
  const imgRef = useRef<HTMLImageElement>(null);

  const { maxHeight, minHeight, maxWidth, minWidth } = constraints;
  const aspectRatio = maxWidth / maxHeight;

  const [crop, setCrop] = useState<Crop | undefined>(undefined);
  const onCropChange = (crop: Crop) => {
    const newCrop = { ...crop };
    if (!newCrop.width || !newCrop.height || newCrop.width <= 0 || newCrop.height <= 0) {
      return;
    }
    newCrop.height = Math.min(Math.max(minHeight, newCrop.height), maxHeight);
    newCrop.width = Math.min(Math.max(minWidth, newCrop.width), maxWidth);
    newCrop.x = Math.max(0, newCrop.x);
    newCrop.y = Math.max(0, newCrop.y);
    setCrop({ ...newCrop, unit: 'px' });
  };

  const resetCrop = () => {
    const img = ensurePresence(imgRef.current);
    if (!img.width || !img.height) {
      throw new Error('Image not loaded yet');
    }
    const crop = getDefaultCropConfigForWhiteboardPreview(img.width, img.height, aspectRatio, maxWidth, maxHeight);
    onCropChange({ ...crop, unit: 'px' });
  };

  const onLoad = useCallback(
    (img: HTMLImageElement) => {
      imgRef.current = img;

      const aspectRatioTolerance = 0.01; // Allow 1% difference

      if (
        // Validate the current crop config:
        currentCropConfig &&
        currentCropConfig.width > 0 &&
        currentCropConfig.height > 0 &&
        // Allow some tolerance in aspect ratio comparison
        Math.abs(currentCropConfig.width / currentCropConfig.height - aspectRatio) <= aspectRatioTolerance &&
        // Make sure crop fits within image bounds
        currentCropConfig.x + currentCropConfig.width <= img.width &&
        currentCropConfig.y + currentCropConfig.height <= img.height
      ) {
        onCropChange({
          unit: 'px',
          width: currentCropConfig.width,
          height: currentCropConfig.height,
          x: currentCropConfig.x,
          y: currentCropConfig.y,
        });
        return;
      } else {
        // If no valid crop config, reset to default:
        resetCrop();
      }
    },
    [aspectRatio, setCrop]
  );

  const handleConfirmCrop = () => {
    const requiredCrop = ensurePresence(crop);
    onChangeCrop({
      x: requiredCrop.x,
      y: requiredCrop.y,
      width: requiredCrop.width,
      height: requiredCrop.height,
    });
  };

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
            {whiteboardPreviewImage && (
              <ReactCrop aspect={aspectRatio} crop={crop} onChange={onCropChange} keepSelection>
                <img
                  src={whiteboardPreviewImage}
                  crossOrigin="anonymous"
                  alt="Crop preview"
                  onLoad={event => onLoad(event.target as HTMLImageElement)}
                />
              </ReactCrop>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogFooter>
        <DialogActions>
          <Box>
            <pre>Img:{JSON.stringify({ width: imgRef.current?.width, height: imgRef.current?.height })}</pre>
            <pre>Constraints:{JSON.stringify(constraints)}</pre>
            <pre>Crop:{JSON.stringify(crop)}</pre>
          </Box>
          <Button variant="outlined" startIcon={<Replay />} onClick={resetCrop}>
            {t('pages.whiteboard.previewSettings.cropDialog.reset')}
          </Button>
          <Divider orientation="vertical" flexItem />
          <Button variant="outlined" startIcon={<Close />} onClick={onClose}>
            {t('pages.whiteboard.previewSettings.cropDialog.cancel')}
          </Button>
          <Button variant="contained" startIcon={<Check />} onClick={handleConfirmCrop}>
            {t('pages.whiteboard.previewSettings.cropDialog.confirm')}
          </Button>
        </DialogActions>
      </DialogFooter>
    </DialogWithGrid>
  );
};

export default WhiteboardPreviewCustomSelectionDialog;
