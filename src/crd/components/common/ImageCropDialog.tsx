import { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import Resizer from 'react-image-file-resizer';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';

export type ImageCropConfig = {
  aspectRatio?: number;
  maxWidth?: number;
  minWidth?: number;
  maxHeight?: number;
  minHeight?: number;
  /** If provided, show aspect ratio slider for this visual type. */
  aspectRatioBounds?: { min: number; max: number };
  /** Callback when aspect ratio is adjusted (for preview). */
  onAspectRatioChange?: (ratio: number) => void;
};

type ImageCropDialogProps = {
  open: boolean;
  file: File | undefined;
  config: ImageCropConfig;
  onSave: (data: { file: File; altText: string; aspectRatio?: number }) => void;
  onCancel: () => void;
  saveLabel: string;
  savingLabel: string;
  cancelLabel: string;
  altTextLabel: string;
  altTextPlaceholder: string;
  title: string;
  description?: string;
};

/**
 * Real pixels the current crop would yield, or undefined before the image has
 * loaded / a crop has been completed. `crop` is in displayed pixels, so it has
 * to be scaled back up by the image's natural-to-displayed ratio.
 */
export function naturalCropSize(
  image: HTMLImageElement | null,
  crop: PixelCrop | undefined
): { width: number; height: number } | undefined {
  if (!image || !crop || !image.width || !image.height) return undefined;
  return {
    width: Math.round(crop.width * (image.naturalWidth / image.width)),
    height: Math.round(crop.height * (image.naturalHeight / image.height)),
  };
}

/**
 * When aspect ratio changes, recalculate crop dimensions to maintain the new ratio.
 * Keeps width constant, adjusts height to match newAspectRatio.
 * Anchors to top-left, expands downward first, then upward if needed.
 */
function recalculateCropForAspectRatio(currentCrop: Crop, newAspectRatio: number): Crop {
  if (!currentCrop.width) return currentCrop;

  const { y = 0, width } = currentCrop;

  // Keep width, recalculate height for new aspect ratio
  const newHeight = width / newAspectRatio;
  let newY = y;

  // Try to expand downward first
  if (y + newHeight > 100) {
    // Hit bottom boundary, shift upward
    newY = Math.max(0, 100 - newHeight);
  }

  return {
    ...currentCrop,
    height: newHeight,
    y: newY,
  };
}

/**
 * ImageCropDialog — CRD-native image crop + resize dialog.
 *
 * Uses `react-image-crop` for the crop UI and `react-image-file-resizer`
 * for canvas → file conversion. Reusable across the CRD design system
 * wherever an image needs to be cropped before upload.
 *
 * The dialog renders a preview of the selected file, lets the user crop
 * with an enforced aspect ratio, enter alt text, and save. The saved file
 * is resized to fit the config's min/max constraints.
 */
export function ImageCropDialog({
  open,
  file,
  config,
  onSave,
  onCancel,
  saveLabel,
  savingLabel,
  cancelLabel,
  altTextLabel,
  altTextPlaceholder,
  title,
  description,
}: ImageCropDialogProps) {
  // The too-small warning is a design-system message about pixel dimensions,
  // not business text, so it lives in `crd-common` rather than being threaded
  // through all nine consumers as yet another label prop.
  const { t } = useTranslation();
  const inputId = useId();
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [altText, setAltText] = useState('');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | undefined>(config.aspectRatio);
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgSrc, setImgSrc] = useState<string>('');

  // Generate a preview URL when the file changes.
  const prevFileRef = useRef<File | undefined>(undefined);
  if (file !== prevFileRef.current) {
    prevFileRef.current = file;
    if (file) {
      const url = URL.createObjectURL(file);
      setImgSrc(url);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setAltText('');
      setSelectedAspectRatio(config.aspectRatio);
    } else {
      setImgSrc('');
    }
  }

  // The resizer upscales to reach `minWidth`/`minHeight` (args 9-10), which
  // would turn a too-small source into an interpolated image that passes server
  // validation but looks soft. Block it here instead, while the user can still
  // pick a bigger file.
  const cropSize = naturalCropSize(imgRef.current, completedCrop);
  const requiredWidth = config.minWidth ?? 0;
  const requiredHeight = config.minHeight ?? 0;
  const tooSmall = Boolean(cropSize && (cropSize.width < requiredWidth || cropSize.height < requiredHeight));

  const currentAspectRatio = selectedAspectRatio ?? config.aspectRatio;

  const handleSave = async () => {
    if (!imgRef.current || !completedCrop || tooSmall) return;
    setSaving(true);
    try {
      const croppedFile = await getCroppedImg(
        imgRef.current,
        completedCrop,
        { ...config, aspectRatio: currentAspectRatio },
        file?.name ?? 'image.png'
      );
      onSave({ file: croppedFile, altText, aspectRatio: selectedAspectRatio });
    } catch {
      // If crop fails, fall back to the original file.
      if (file) {
        onSave({ file, altText, aspectRatio: selectedAspectRatio });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) onCancel();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto">
          {description && <DialogDescription>{description}</DialogDescription>}
          {imgSrc && (
            <div className="flex shrink-0 justify-center overflow-hidden rounded-md bg-muted">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
                aspect={currentAspectRatio}
                className="max-h-[60vh]"
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Crop preview"
                  className="max-h-[60vh] object-contain"
                  onLoad={() => {
                    // Set an initial centered crop.
                    if (!crop && imgRef.current && config.aspectRatio) {
                      const { naturalWidth, naturalHeight } = imgRef.current;
                      const ar = config.aspectRatio;
                      let cropW = naturalWidth;
                      let cropH = cropW / ar;
                      if (cropH > naturalHeight) {
                        cropH = naturalHeight;
                        cropW = cropH * ar;
                      }
                      const pctW = (cropW / naturalWidth) * 100;
                      const pctH = (cropH / naturalHeight) * 100;
                      const x = (100 - pctW) / 2;
                      const y = (100 - pctH) / 2;
                      setCrop({ unit: '%', width: pctW, height: pctH, x, y });
                    }
                  }}
                />
              </ReactCrop>
            </div>
          )}

          {tooSmall && cropSize && (
            <p role="alert" className="text-body text-destructive">
              {t('imageCrop.tooSmall', {
                requiredWidth,
                requiredHeight,
                actualWidth: cropSize.width,
                actualHeight: cropSize.height,
              })}
            </p>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="crop-alt-text" className="text-body-emphasis">
              {altTextLabel}
            </label>
            <Input
              id="crop-alt-text"
              value={altText}
              onChange={e => setAltText(e.target.value)}
              placeholder={altTextPlaceholder}
            />
          </div>

          {config.aspectRatioBounds && (
            <div className="flex flex-col gap-2">
              <label htmlFor={inputId} className="text-body-emphasis">
                {t('imageCrop.aspectRatio.label', { defaultValue: 'Image shape' })}
              </label>
              <div className="flex items-center gap-3">
                <input
                  id={inputId}
                  type="range"
                  min={config.aspectRatioBounds.min}
                  max={config.aspectRatioBounds.max}
                  step={0.1}
                  value={selectedAspectRatio ?? config.aspectRatioBounds.min}
                  onChange={e => {
                    const ratio = Number(e.target.value);
                    setSelectedAspectRatio(ratio);
                    config.onAspectRatioChange?.(ratio);
                    // Force crop recalculation when aspect ratio changes
                    if (crop) {
                      setCrop(recalculateCropForAspectRatio(crop, ratio));
                    }
                  }}
                  aria-valuetext={t('imageCrop.aspectRatio.value', {
                    defaultValue: 'Aspect ratio: {{ratio}}',
                    ratio: (selectedAspectRatio ?? config.aspectRatioBounds.min).toFixed(1),
                  })}
                  className="w-full max-w-[320px] accent-primary"
                />
                <span className="text-caption tabular-nums whitespace-nowrap">
                  {(selectedAspectRatio ?? config.aspectRatioBounds.min).toFixed(1)}
                </span>
              </div>
              <p className="text-caption text-muted-foreground">
                {t('imageCrop.aspectRatio.hint', {
                  defaultValue: 'Left: taller • Right: wider',
                })}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            {cancelLabel}
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving || !completedCrop || tooSmall} aria-busy={saving}>
            {saving ? savingLabel : saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Crop + resize the image to a File that fits the config's constraints.
 *
 * Mirrors the legacy MUI `CropDialog.getCroppedImg`
 * (`src/core/ui/upload/VisualUpload/CropDialog.tsx`) so the output respects
 * the visual's full `min/maxWidth` and `min/maxHeight`. Critically, the
 * resizer call passes **both** the upper bounds (args 2-3) AND the lower
 * bounds (args 9-10) — without `minWidth`/`minHeight` the resizer never
 * upscales, and the server rejects uploads below the visual's lower bound
 * (e.g. `Upload image has a width resolution of '169' which is not in the
 * allowed range of 190 - 410 pixels`).
 *
 * The canvas is sized to the crop's **natural** pixels only. It deliberately
 * does NOT multiply by `devicePixelRatio`: `scaleX`/`scaleY` already convert
 * from displayed to natural pixels, so a DPR factor on top would interpolate
 * the source up to 2-3x its real resolution — more bytes, no more detail, and
 * a soft image once the visual's `maxWidth` is large enough to let it through.
 */
async function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop,
  config: ImageCropConfig,
  fileName: string
): Promise<File> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Round to integers to match validation bounds and avoid truncation during canvas coercion.
  const sourceWidth = Math.round(crop.width * scaleX);
  const sourceHeight = Math.round(crop.height * scaleY);

  canvas.width = sourceWidth;
  canvas.height = sourceHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    Math.round(crop.x * scaleX),
    Math.round(crop.y * scaleY),
    sourceWidth,
    sourceHeight,
    0,
    0,
    sourceWidth,
    sourceHeight
  );

  // Quality 1 on a banner-sized canvas produces a multi-megabyte JPEG that is
  // visually indistinguishable from 0.92 — the whole point of raising the
  // dimension ceiling is more pixels, not more bytes per pixel.
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))), 'image/jpeg', 0.92);
  });

  // Resizer arguments — keep max >= min so the resizer never receives a
  // contradictory range when the consumer passes only one side of the bound.
  const minWidth = config.minWidth ?? 0;
  const minHeight = config.minHeight ?? 0;
  const maxWidth = Math.max(config.maxWidth ?? canvas.width, minWidth);
  const maxHeight = Math.max(config.maxHeight ?? canvas.height, minHeight);

  return new Promise<File>((resolve, reject) => {
    // Workaround for a Vite + react-image-file-resizer interop issue — the
    // package occasionally exposes `Resizer` only under `.default`.
    const resizer = (Resizer as unknown as { default?: typeof Resizer }).default ?? Resizer;

    resizer.imageFileResizer(
      new File([blob], fileName, { type: 'image/jpeg' }),
      maxWidth,
      maxHeight,
      'JPEG',
      100,
      0,
      (result: unknown) => {
        if (result instanceof File) {
          resolve(result);
        } else if (result instanceof Blob) {
          resolve(new File([result], fileName, { type: 'image/jpeg' }));
        } else if (typeof result === 'string') {
          fetch(result)
            .then(r => r.blob())
            .then(b => resolve(new File([b], fileName, { type: 'image/jpeg' })))
            .catch(reject);
        } else {
          reject(new Error('Unexpected resizer output'));
        }
      },
      'file',
      minWidth,
      minHeight
    );
  });
}
