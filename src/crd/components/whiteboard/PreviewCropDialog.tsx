import { RotateCcw } from 'lucide-react';
import { type PointerEvent, useEffect, useRef, useState, type WheelEvent } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';

type CropRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type PreviewCropDialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  previewImage?: Blob;
  initialCrop?: CropRegion;
  aspectRatio: number;
  onCropSave: (crop: CropRegion) => void;
};

const MIN_SELECTION_SIZE = 0.05;
const MIN_SCALE = 1;
const MAX_SCALE = 8;
const SCALE_STEP = 0.1;

function getDefaultCrop(imgWidth: number, imgHeight: number, aspect: number): CropRegion {
  const imageAspect = imgWidth / imgHeight;
  let width: number;
  let height: number;
  if (imageAspect > aspect) {
    height = imgHeight * 0.8;
    width = height * aspect;
  } else {
    width = imgWidth * 0.8;
    height = width / aspect;
  }
  return {
    x: (imgWidth - width) / 2,
    y: (imgHeight - height) / 2,
    width,
    height,
  };
}

function clampPan(pan: { x: number; y: number }, img: HTMLImageElement | null, scale: number) {
  if (!img) return pan;
  const maxX = (img.width * (scale - 1)) / 2;
  const maxY = (img.height * (scale - 1)) / 2;
  return {
    x: Math.max(-maxX, Math.min(maxX, pan.x)),
    y: Math.max(-maxY, Math.min(maxY, pan.y)),
  };
}

export function PreviewCropDialog({
  open,
  onClose,
  title,
  previewImage,
  initialCrop,
  aspectRatio,
  onCropSave,
}: PreviewCropDialogProps) {
  const { t } = useTranslation('crd-whiteboard');
  const imgRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);
  const [crop, setCrop] = useState<Crop | undefined>(undefined);
  const [imgScale, setImgScale] = useState(MIN_SCALE);
  const [imgPan, setImgPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panPointerRef = useRef<number | null>(null);
  const panOriginRef = useRef<{ x: number; y: number } | null>(null);
  const imgPanRef = useRef(imgPan);

  useEffect(() => {
    imgPanRef.current = imgPan;
  }, [imgPan]);

  const [imageObjectUrl, setImageObjectUrl] = useState<string>();

  useEffect(() => {
    if (open && previewImage) {
      setImgPan({ x: 0, y: 0 });
      setIsPanning(false);
      const url = URL.createObjectURL(previewImage);
      setImageObjectUrl(url);
      return () => {
        setImageObjectUrl(undefined);
        URL.revokeObjectURL(url);
      };
    }
  }, [open, previewImage]);

  const applyCrop = (region: CropRegion) => {
    setCrop({ x: region.x, y: region.y, width: region.width, height: region.height, unit: 'px' });
  };

  const resetCrop = () => {
    const img = imgRef.current;
    if (!img) return;
    const defaultCrop = getDefaultCrop(img.width, img.height, aspectRatio);
    applyCrop(defaultCrop);
    setImgScale(MIN_SCALE);
    setImgPan({ x: 0, y: 0 });
  };

  const onLoad = (img: HTMLImageElement) => {
    imgRef.current = img;
    setReady(true);
    setImgScale(MIN_SCALE);
    setImgPan({ x: 0, y: 0 });
    if (initialCrop) {
      applyCrop(initialCrop);
    } else {
      const defaultCrop = getDefaultCrop(img.width, img.height, aspectRatio);
      applyCrop(defaultCrop);
    }
  };

  const handleConfirm = () => {
    if (!crop || !imgRef.current) return;
    onCropSave({ x: crop.x, y: crop.y, width: crop.width, height: crop.height });
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!ready) return;
    const direction = event.deltaY < 0 ? 1 : -1;
    setImgScale(prev => {
      const next = Number((prev + direction * SCALE_STEP).toFixed(2));
      const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
      setImgPan(current => clampPan(current, imgRef.current, clamped));
      return clamped;
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.target !== imgRef.current || !ready) return;
    event.preventDefault();
    event.stopPropagation();
    panPointerRef.current = event.pointerId;
    panOriginRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (panPointerRef.current !== event.pointerId || !panOriginRef.current) return;
    event.preventDefault();
    const dx = event.clientX - panOriginRef.current.x;
    const dy = event.clientY - panOriginRef.current.y;
    panOriginRef.current = { x: event.clientX, y: event.clientY };
    setImgPan(prev => clampPan({ x: prev.x + dx, y: prev.y + dy }, imgRef.current, imgScale));
  };

  const endPan = (event: PointerEvent<HTMLDivElement>) => {
    if (panPointerRef.current !== event.pointerId) return;
    event.preventDefault();
    panPointerRef.current = null;
    panOriginRef.current = null;
    setIsPanning(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-2xl p-0" closeLabel={t('preview.crop.cancel')}>
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{title ?? t('preview.modes.CUSTOM.title')}</DialogTitle>
        </DialogHeader>

        <div className="px-6">
          <div
            className={cn(
              'overflow-hidden rounded-md border border-border',
              'max-h-[calc(100vh-350px)]',
              ready ? (isPanning ? 'cursor-grabbing' : 'cursor-move') : 'cursor-default'
            )}
            style={{ aspectRatio, touchAction: 'none' }}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endPan}
            onPointerLeave={endPan}
            onPointerCancel={endPan}
          >
            {!previewImage || !imageObjectUrl ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                {t('preview.crop.loading')}
              </div>
            ) : (
              <ReactCrop
                aspect={aspectRatio}
                minWidth={imgRef.current?.width ? imgRef.current.width * MIN_SELECTION_SIZE : undefined}
                crop={crop}
                onChange={c => setCrop(c)}
                keepSelection={true}
              >
                <img
                  src={imageObjectUrl}
                  crossOrigin="anonymous"
                  alt={t('preview.crop.previewArea')}
                  style={{
                    transform: `translate(${imgPanRef.current.x}px, ${imgPanRef.current.y}px) scale(${imgScale})`,
                  }}
                  onLoad={event => onLoad(event.target as HTMLImageElement)}
                />
              </ReactCrop>
            )}
          </div>

          <div className="py-3">
            <input
              type="range"
              min={MIN_SCALE}
              max={MAX_SCALE}
              step={SCALE_STEP}
              value={imgScale}
              disabled={!ready}
              onChange={e => {
                const next = Number(e.target.value);
                setImgScale(next);
                setImgPan(current => clampPan(current, imgRef.current, next));
              }}
              className="w-full accent-primary h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              aria-label={t('preview.crop.zoom')}
            />
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={resetCrop} disabled={!ready}>
            <RotateCcw className="size-4 mr-1" aria-hidden="true" />
            {t('preview.crop.reset')}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t('preview.crop.cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={!ready}>
            {t('preview.crop.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
