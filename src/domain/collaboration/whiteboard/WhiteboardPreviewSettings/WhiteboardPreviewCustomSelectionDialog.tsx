import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid, { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import { Box, Button, DialogActions, DialogContent } from '@mui/material';
import { WhiteboardPreviewSettingsIcon } from './icons/WhiteboardPreviewIcons';
import { useTranslation } from 'react-i18next';
import { Check, Close, Replay } from '@mui/icons-material';
import Loading from '@/core/ui/loading/Loading';
import ReactCrop, { Crop } from 'react-image-crop';
import { useCallback, useRef, useState } from 'react';

interface CropConfig {
  aspectRatio?: number;
  maxHeight?: number;
  minHeight?: number;
  maxWidth?: number;
  minWidth?: number;
}

interface WhiteboardPreviewCustomSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  whiteboardPreviewImage: string | undefined;
  config?: CropConfig;
}

const ASPECT_RATIO = 1;
// const MAX_WIDTH = 400;
// const MIN_WIDTH = 200;
// const MAX_HEIGHT = 400;
// const MIN_HEIGHT = 200;

const WhiteboardPreviewCustomSelectionDialog = ({
  open,
  onClose,
  whiteboardPreviewImage,
  config,
}: WhiteboardPreviewCustomSelectionDialogProps) => {
  const { t } = useTranslation();
  const imgRef = useRef<HTMLImageElement>(null);

  const {
    aspectRatio = ASPECT_RATIO,
    // maxHeight = MAX_HEIGHT,
    // minHeight = MIN_HEIGHT,
    // maxWidth = MAX_WIDTH,
    // minWidth = MIN_WIDTH,
  } = config ?? {};

  const onCropChange = (newCrop: Crop) => {
    if (!newCrop.width || !newCrop.height) {
      return;
    }
    newCrop.height = Math.max(0, newCrop.height);
    newCrop.width = Math.max(0, newCrop.width);
    newCrop.x = Math.max(0, newCrop.x);
    newCrop.y = Math.max(0, newCrop.y);
    setCrop(newCrop);
  };

  const [crop, setCrop] = useState<Crop | undefined>(undefined);

  const onLoad = useCallback(
    (img: HTMLImageElement) => {
      imgRef.current = img;

      const aspect = aspectRatio;
      // calculate in ratio
      const widthRatio = img.width / aspect < img.height * aspect ? 1 : (img.height * aspect) / img.width;
      const heightRatio = img.width / aspect > img.height * aspect ? 1 : img.width / aspect / img.height;

      // calculate in pixels
      const width = img.width * widthRatio;
      const height = img.height * heightRatio;

      const y = ((1 - heightRatio) / 2) * img.height;
      const x = ((1 - widthRatio) / 2) * img.width;

      setCrop({
        unit: 'px',
        width,
        height,
        x,
        y,
      });

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
              <ReactCrop aspect={aspectRatio} crop={crop} onChange={onCropChange}>
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
