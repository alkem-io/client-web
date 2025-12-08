import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import { Box, Button, Dialog, DialogActions, DialogContent, Divider, Slider } from '@mui/material';
import { WhiteboardPreviewSettingsIcon } from './icons/WhiteboardPreviewIcons';
import { useTranslation } from 'react-i18next';
import { Check, Close, Replay } from '@mui/icons-material';
import Loading from '@/core/ui/loading/Loading';
import ReactCrop, { Crop } from 'react-image-crop';
import { PointerEvent, useCallback, useEffect, useRef, useState, WheelEvent } from 'react';
import { WhiteboardPreviewVisualDimensions } from '../WhiteboardVisuals/WhiteboardVisualsDimensions';
import { PreviewImageDimensions } from '../WhiteboardVisuals/WhiteboardPreviewImagesModels';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { CropConfig } from '@/core/utils/images/cropImage';
import { getDefaultCropConfigForWhiteboardPreview } from '../WhiteboardVisuals/utils/getDefaultCropConfigForWhiteboardPreview';
import validateCropConfig from '../WhiteboardVisuals/utils/validateCropConfig';

interface WhiteboardPreviewCustomSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  dialogTitle?: string;
  whiteboardPreviewImage: Blob | undefined;
  cropConfig?: CropConfig;
  previewImageConstraints?: PreviewImageDimensions;
  onCropSave: (newCrop: CropConfig) => void;
}

const MINIMUM_SELECTION_SIZE = 0.05; // 5% of the image width
const MIN_SCALE = 1;
const MAX_SCALE = 8;
const SCALE_STEP = 0.1;
const ZERO_PAN = { x: 0, y: 0 };

const clampValue = (value: number, min: number, max: number): number => {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
};

const clampTranslation = (
  translation: { x: number; y: number },
  img: HTMLImageElement | null,
  scale: number
): { x: number; y: number } => {
  if (!img) {
    return translation;
  }
  const viewportWidth = img.width;
  const viewportHeight = img.height;
  const maxOffsetX = Math.max(0, (viewportWidth * scale - viewportWidth) / 2);
  const maxOffsetY = Math.max(0, (viewportHeight * scale - viewportHeight) / 2);

  return {
    x: clampValue(translation.x, -maxOffsetX, maxOffsetX),
    y: clampValue(translation.y, -maxOffsetY, maxOffsetY),
  };
};
/*
const applyPanToCrop = ({
  cropConfig,
  translation,
  scale,
  img,
}: {
  cropConfig: CropConfig;
  translation: { x: number; y: number };
  scale: number;
  img: { width: number; height: number };
}): CropConfig => {
  if ((!translation.x && !translation.y) || scale === 0) {
    return cropConfig;
  }

  const deltaX = translation.x / scale;
  const deltaY = translation.y / scale;
  const maxX = Math.max(0, img.width - cropConfig.width);
  const maxY = Math.max(0, img.height - cropConfig.height);

  return {
    ...cropConfig,
    x: clampValue(cropConfig.x - deltaX, 0, maxX),
    y: clampValue(cropConfig.y - deltaY, 0, maxY),
  };
};
*/

/*  const commitTranslationIntoCrop = useCallback((): Crop | undefined => {
    const img = imgRef.current;
    if (!img) {
      return crop;
    }
    if (!crop) {
      setTranslation({ x: 0, y: 0 });
      return undefined;
    }
    if (!translationRef.current.x && !translationRef.current.y) {
      return crop;
    }

    const updatedCropConfig = applyPanToCrop({
      cropConfig: crop,
      translation: translationRef.current,
      scale,
      img,
    });

    const updatedCrop: Crop = {
      ...updatedCropConfig,
      unit: 'px',
    };

    setCrop(updatedCrop);
    setTranslation({ x: 0, y: 0 });

    return updatedCrop;
  }, [crop, scale]);
  */

const translateCropConfig = ({
  cropConfig,
  img,
  scale = MIN_SCALE,
  pan = ZERO_PAN,
  inverse,
}: {
  cropConfig: CropConfig | undefined;
  img: { width: number; height: number; naturalWidth: number; naturalHeight: number } | null;
  scale?: number;
  pan?: { x: number; y: number };
  inverse?: boolean;
}): CropConfig | undefined => {
  if (!cropConfig || !img) {
    return undefined;
  }
  console.log({
    cropConfig,
    width: img.width,
    height: img.height,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    scale,
    pan,
    inverse,
  });
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
  dialogTitle,
  onCropSave,
  whiteboardPreviewImage,
  cropConfig,
  previewImageConstraints = WhiteboardPreviewVisualDimensions,
}: WhiteboardPreviewCustomSelectionDialogProps) => {
  const { t } = useTranslation();
  const ensurePresence = useEnsurePresence();
  const imgRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);

  const { aspectRatio } = previewImageConstraints;
  const [crop, setCrop] = useState<Crop | undefined>(undefined);

  const [imgScale, setImgScale] = useState(1);
  const [imgPan, setImgPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const imgPanRef = useRef(imgPan);
  const imgPanPointerRef = useRef<number | null>(null);
  const imgPanPointerOriginRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    imgPanRef.current = imgPan;
  }, [imgPan]);

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
    setImgScale(MIN_SCALE);
    setImgPan({ x: 0, y: 0 });
  };

  const onLoad = useCallback(
    (img: HTMLImageElement) => {
      imgRef.current = img;
      setReady(true);
      setImgScale(MIN_SCALE);
      setImgPan({ x: 0, y: 0 });
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
    /* const updatedCrop = commitTranslationIntoCrop(); */
    const cropConfig = ensurePresence(crop);
    const img = ensurePresence(imgRef.current);
    // Translate crop to the real generated image dimensions:
    const translatedCrop = translateCropConfig({
      cropConfig,
      img,
      scale: imgScale,
      pan: imgPan,
      inverse: false,
    });
    onCropSave(translatedCrop!); // translatedCrop is guaranteed by the ensurePresence cropConfig and img
  };

  const [imageObjectUrl, setImageObjectUrl] = useState<string>();

  const handleWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      if (!ready) {
        return;
      }
      const deltaDirection = event.deltaY < 0 ? 1 : -1;
      setImgScale(previousScale => {
        const nextScale = Number((previousScale + deltaDirection * SCALE_STEP).toFixed(2));
        if (nextScale < MIN_SCALE) {
          setImgPan(current => clampTranslation(current, imgRef.current, MIN_SCALE));
          return MIN_SCALE;
        }
        if (nextScale > MAX_SCALE) {
          setImgPan(current => clampTranslation(current, imgRef.current, MAX_SCALE));
          return MAX_SCALE;
        }
        setImgPan(current => clampTranslation(current, imgRef.current, nextScale));
        return nextScale;
      });
    },
    [ready]
  );

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.target !== imgRef.current || !ready) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    imgPanPointerRef.current = event.pointerId;
    imgPanPointerOriginRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (imgPanPointerRef.current !== event.pointerId || !imgPanPointerOriginRef.current) {
      return;
    }
    event.preventDefault();
    const deltaX = event.clientX - imgPanPointerOriginRef.current.x;
    const deltaY = event.clientY - imgPanPointerOriginRef.current.y;
    imgPanPointerOriginRef.current = { x: event.clientX, y: event.clientY };
    setImgPan(previousTranslation =>
      clampTranslation(
        {
          x: previousTranslation.x + deltaX,
          y: previousTranslation.y + deltaY,
        },
        imgRef.current,
        imgScale
      )
    );
  };

  const endPan = (event: PointerEvent<HTMLDivElement>) => {
    if (imgPanPointerRef.current !== event.pointerId) {
      return;
    }
    event.preventDefault();
    //commitTranslationIntoCrop();
    imgPanPointerRef.current = null;
    imgPanPointerOriginRef.current = null;
    setIsPanning(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  useEffect(() => {
    if (open && whiteboardPreviewImage) {
      const objectUrl = URL.createObjectURL(whiteboardPreviewImage);
      setImageObjectUrl(objectUrl);
      setImgPan({ x: 0, y: 0 });
      setIsPanning(false);

      return () => {
        setImageObjectUrl(undefined);
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [open, whiteboardPreviewImage]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false}>
      <DialogHeader
        title={dialogTitle ?? t('pages.whiteboard.previewSettings.modes.CUSTOM.title')}
        onClose={onClose}
        icon={<WhiteboardPreviewSettingsIcon />}
      />
      <DialogContent sx={{ userSelect: 'none', overflow: 'hidden' }}>
        {(!whiteboardPreviewImage || !imageObjectUrl) && <Loading />}
        {whiteboardPreviewImage && (
          <Box
            sx={{
              maxHeight: 'calc(100vh - 350px)',
              aspectRatio: aspectRatio,
              overflow: 'hidden',
              cursor: ready ? (isPanning ? 'grabbing' : 'move') : 'default',
              touchAction: 'none',
            }}
            onWheel={handleWheel}
            onScroll={e => e.preventDefault()}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endPan}
            onPointerLeave={endPan}
            onPointerCancel={endPan}
          >
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
                style={{
                  transform: `translate(${imgPanRef.current.x}px, ${imgPanRef.current.y}px) scale(${imgScale})`,
                }}
                onLoad={event => onLoad(event.target as HTMLImageElement)}
              />
            </ReactCrop>
          </Box>
        )}
        <Slider
          max={MAX_SCALE}
          min={MIN_SCALE}
          step={SCALE_STEP}
          value={imgScale}
          disabled={!ready}
          onChange={(event, value) => {
            const nextScale = value as number;
            setImgScale(nextScale);
            setImgPan(current => clampTranslation(current, imgRef.current, nextScale));
          }}
        />
        <pre>{JSON.stringify({ crop, imgScale, imgPan })}</pre>
      </DialogContent>
      <DialogFooter>
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
    </Dialog>
  );
};

export default WhiteboardPreviewCustomSelectionDialog;
