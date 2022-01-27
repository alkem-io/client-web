import { Box, Button, Dialog, DialogActions, DialogContent, DialogProps } from '@mui/material';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Resizer from 'react-image-file-resizer';

interface CropDialogConfig {
  aspectRatio?: number;
  maxHeight?: number;
  minHeight?: number;
  maxWidth?: number;
  minWidth?: number;
}

interface CropDialogInterface extends DialogProps {
  file?: File;
  onSave?: (imgFile: File) => Promise<void> | void;
  config: CropDialogConfig;
}

const ASPECT_RATIO = 1;
const MAX_WIDTH = 400;
const MIN_WIDTH = 200;
const MAX_HEIGHT = 400;
const MIN_HEIGHT = 200;

export const CropDialog: FC<CropDialogInterface> = ({ file, onSave, config, ...rest }) => {
  const { t } = useTranslation();
  const imgRef = useRef<HTMLImageElement>();

  const {
    aspectRatio = ASPECT_RATIO,
    maxHeight = MAX_HEIGHT,
    minHeight = MIN_HEIGHT,
    maxWidth = MAX_WIDTH,
    minWidth = MIN_WIDTH,
  } = config;
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Partial<Crop>>({ aspect: aspectRatio });

  const onCropChange = (crop: Crop, _percentCrop: Crop) => {
    // You could also use percentCrop:
    setCrop(crop);
  };

  const onLoad = useCallback((img: HTMLImageElement) => {
    imgRef.current = img;

    const aspect = aspectRatio;
    // calculate in ration
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
      aspect,
    });

    return false; // Return false if you set crop state in here.
  }, []);

  useEffect(() => {
    const reader = new FileReader();
    const loadFile = () => setSrc(reader.result as string);
    reader.addEventListener('load', loadFile);

    if (file) {
      reader.readAsDataURL(file);
    }

    return () => reader.removeEventListener('load', loadFile);
  }, [file]);

  const getCroppedImg = (image: HTMLImageElement, crop: Crop, fileName: string) => {
    const canvas = document.createElement('canvas');
    const pixelRatio = window.devicePixelRatio;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Can not create canvas context');

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise<File>((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) {
            try {
              Resizer.imageFileResizer(
                blob,
                maxWidth,
                maxHeight,
                'JPEG',
                100,
                0,
                uri => {
                  resolve(new File([uri as Blob], fileName, { type: 'image/jpeg' }));
                },
                'blob',
                minWidth,
                minHeight
              );
            } catch (err) {
              console.error(err);
              reject(err);
            }
          }
        },
        'image/jpeg',
        1
      );
    });
  };

  const handleClose = useCallback(() => rest.onClose && rest.onClose({}, 'escapeKeyDown'), [rest.onClose]);

  const handleSave = useCallback(async () => {
    if (!imgRef.current) return;
    const newImage = await getCroppedImg(imgRef.current, crop as Crop, 'newFile.jpg');
    if (onSave) await onSave(newImage);
    handleClose();
  }, [crop, getCroppedImg, onSave, handleClose]);

  return (
    <Dialog
      fullWidth
      maxWidth={'md'}
      sx={{
        '& img': {
          width: '100%',
        },
      }}
      {...rest}
    >
      <DialogContent>
        <Box display="flex" justifyContent="center" sx={{ backgroundColor: t => t.palette.grey[800] }}>
          {src && <ReactCrop src={src} crop={crop} onChange={onCropChange} onImageLoaded={onLoad} />}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('buttons.cancel')}</Button>
        <Button variant="contained" onClick={handleSave}>
          {t('buttons.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
