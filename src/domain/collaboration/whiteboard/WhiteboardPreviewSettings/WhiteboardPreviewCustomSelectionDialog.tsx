import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid, { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import { Box, Button, DialogActions, DialogContent } from '@mui/material';
import { WhiteboardPreviewSettingsIcon } from './icons/WhiteboardPreviewIcons';
import { useTranslation } from 'react-i18next';
import { Check, Close, Replay } from '@mui/icons-material';
import Loading from '@/core/ui/loading/Loading';
import ReactCrop, { Crop } from 'react-image-crop';
import { useCallback, useRef, useState } from 'react';
import { BannerDimensions } from '../WhiteboardPreviewImages/WhiteboardDimensions';

interface CropConfig {
  maxHeight: number;
  minHeight: number;
  maxWidth: number;
  minWidth: number;
}

interface WhiteboardPreviewCustomSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  whiteboardPreviewImage: string | undefined;
  config?: CropConfig;
}

const WhiteboardPreviewCustomSelectionDialog = ({
  open,
  onClose,
  whiteboardPreviewImage,
  config = BannerDimensions,
}: WhiteboardPreviewCustomSelectionDialogProps) => {
  const { t } = useTranslation();
  const imgRef = useRef<HTMLImageElement>(null);

  const { maxHeight, minHeight, maxWidth, minWidth } = config;
  const aspectRatio = maxWidth / maxHeight;

  const onCropChange = (crop: Crop) => {
    const newCrop = { ...crop };
    if (!newCrop.width || !newCrop.height) {
      return;
    }
    //console.log('onCropChange', config, newCrop);
    newCrop.height = Math.min(Math.max(minHeight, newCrop.height), maxHeight);

    console.log({
      newCropWidth: newCrop.width,
      minWidth,
      maxWidth,
      max_minWidth_newCropWidth: Math.max(minWidth, newCrop.width),
      min_maxWidth_thePrevious: Math.min(Math.max(minWidth, newCrop.width), maxWidth),
    });
    newCrop.width = Math.min(Math.max(minWidth, newCrop.width), maxWidth);
    newCrop.x = Math.max(0, newCrop.x);
    newCrop.y = Math.max(0, newCrop.y);
    setCrop({ ...newCrop, unit: 'px' });
  };

  const [crop, setCrop] = useState<Crop | undefined>(undefined);

  const onLoad = useCallback(
    (img: HTMLImageElement) => {
      imgRef.current = img;

      const imageAspectRatio = img.width / img.height;
      let x = 0,
        y = 0;
      console.log('onLoad', { imageAspectRatio, aspectRatio });
      if (imageAspectRatio > aspectRatio) {
        // Image is wider than desired aspect ratio
        // Try to take full height:
        const cropHeight = Math.min(img.height, maxHeight);
        const cropWidth = cropHeight * aspectRatio;
        x = Math.max(
          0,
          Math.min(
            img.width / 2 - cropWidth / 2, // desired x, centered horizontally
            img.width - cropWidth // max x to not overflow
          )
        );
        onCropChange({
          unit: 'px',
          width: cropWidth,
          height: cropHeight,
          x,
          y,
        });
      } else {
        // Try to take full width:
        const cropWidth = Math.min(img.width, maxWidth);
        const cropHeight = cropWidth / aspectRatio;
        y = Math.max(
          0,
          Math.min(
            img.height / 2 - cropHeight / 2, // desired y, centered vertically
            img.height - cropHeight // max y to not overflow
          )
        );
        onCropChange({
          unit: 'px',
          width: cropWidth,
          height: cropHeight,
          x,
          y,
        });
      }

      return false; // Return false if you set crop state in here.
    },
    [aspectRatio, setCrop]
  );

  return (
    <DialogWithGrid open={open} onClose={onClose} fullWidth>
      <DialogHeader
        title={t('pages.whiteboard.previewSettings.modes.custom.title')}
        onClose={onClose}
        icon={<WhiteboardPreviewSettingsIcon />}
      />
      <DialogContent>
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
        <pre>{JSON.stringify(crop)}</pre>
      </DialogContent>
      <DialogFooter>
        <DialogActions>
          <Button variant="outlined" startIcon={<Replay />}>
            {t('pages.whiteboard.previewSettings.cropDialog.reset')}
          </Button>
          <Button variant="outlined" startIcon={<Close />} onClick={onClose}>
            {t('pages.whiteboard.previewSettings.cropDialog.cancel')}
          </Button>
          <Button variant="contained" startIcon={<Check />}>
            {t('pages.whiteboard.previewSettings.cropDialog.confirm')}
          </Button>
        </DialogActions>
      </DialogFooter>
    </DialogWithGrid>
  );
};

export default WhiteboardPreviewCustomSelectionDialog;
