import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactCrop, {
  type Crop,
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
  type PercentCrop,
  type PixelCrop,
} from 'react-image-crop';
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
 * The largest crop of `ratio` that fits the displayed image, centred.
 *
 * `makeAspectCrop` / `centerCrop` come from `react-image-crop` itself, and are
 * used rather than hand-rolled arithmetic because a `%` crop has **two bases**:
 * `width` is a share of the box width, `height` a share of the box height. So
 * `height = width / ratio` in percent space is only correct on a square image —
 * on anything else it skews the crop by the image's own aspect ratio. The
 * library does the % → px → % round trip, and clamps on both axes so the crop
 * can never extend past the image (which would leave the canvas untouched
 * outside the bitmap and encode as black bars in the JPEG).
 *
 * Changing the ratio re-centres at maximum size rather than trying to preserve
 * the user's pan: the alternative shrinks the crop on every clamp, so dragging
 * the slider back and forth ratchets it smaller and never recovers.
 */
export function centeredAspectCrop(image: HTMLImageElement, ratio: number): PercentCrop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 100 }, ratio, image.width, image.height),
    image.width,
    image.height
  );
}

/**
 * The ratio the dialog opens on — the configured one, held inside the slider's
 * bounds when a slider is shown. Without the clamp a configured ratio outside
 * `aspectRatioBounds` leaves the range input's thumb clamped by the DOM while
 * state keeps the out-of-range value, so the label, the thumb and the crop all
 * disagree.
 */
function initialAspectRatio({ aspectRatio, aspectRatioBounds }: ImageCropConfig): number | undefined {
  if (!aspectRatioBounds) return aspectRatio;
  return Math.min(Math.max(aspectRatio ?? aspectRatioBounds.min, aspectRatioBounds.min), aspectRatioBounds.max);
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
  const sliderId = useId();
  const altTextId = useId();
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [altText, setAltText] = useState('');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | undefined>(() => initialAspectRatio(config));
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgSrc, setImgSrc] = useState<string>('');

  // Drop the previous file's editing state as soon as a new file arrives, so
  // the dialog never shows the old crop while the new preview loads.
  const prevFileRef = useRef<File | undefined>(undefined);
  if (file !== prevFileRef.current) {
    prevFileRef.current = file;
    setCrop(undefined);
    setCompletedCrop(undefined);
    setAltText('');
    setSelectedAspectRatio(initialAspectRatio(config));
  }

  // The preview URL is a side effect and owns a resource, so it belongs in an
  // effect: created during render it leaks one object URL per StrictMode
  // double-invoke, and nothing ever revokes it.
  useEffect(() => {
    if (!file) {
      setImgSrc('');
      return;
    }
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // The resizer upscales to reach `minWidth`/`minHeight` (args 9-10), which
  // would turn a too-small source into an interpolated image that passes server
  // validation but looks soft. Block it here instead, while the user can still
  // pick a bigger file.
  const cropSize = naturalCropSize(imgRef.current, completedCrop);
  const requiredWidth = config.minWidth ?? 0;
  const requiredHeight = config.minHeight ?? 0;
  const tooSmall = Boolean(cropSize && (cropSize.width < requiredWidth || cropSize.height < requiredHeight));

  const currentAspectRatio = selectedAspectRatio ?? config.aspectRatio;

  // `onComplete` fires only on pointer/keyboard interaction with the crop box
  // (plus the very first undefined → crop transition — see `componentDidUpdate`
  // in react-image-crop). A programmatic crop change must therefore set
  // `completedCrop` itself: it is the only value Save and the too-small check
  // read, so leaving it stale saves the pre-slider crop under the post-slider
  // ratio, and the visual is then rendered at a ratio its pixels don't have.
  const applyCrop = (next: PercentCrop) => {
    const image = imgRef.current;
    if (!image) return;
    setCrop(next);
    setCompletedCrop(convertToPixelCrop(next, image.width, image.height));
  };

  const handleSave = async () => {
    if (!imgRef.current || !completedCrop || tooSmall) return;
    setSaving(true);
    try {
      const croppedFile = await getCroppedImg(imgRef.current, completedCrop, config, file?.name ?? 'image.png');
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
      {/*
       * Widths are `sm:`-prefixed: `DialogContent`'s base class carries
       * `sm:max-w-lg`, and an unprefixed `max-w-*` loses to it on source order
       * at every breakpoint above 640px. Cropping is the one dialog that wants
       * as much of the screen as it can get, so it steps up to the largest
       * ladder in the design system.
       */}
      <DialogContent className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
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
                // ReactCrop's own CSS chains `max-height: inherit` down to the
                // child wrapper and the <img>, so this cap has to be a viewport
                // unit — a percentage or flex-fill has nothing to resolve
                // against and collapses the preview.
                className="max-h-[68vh]"
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt={t('imageCrop.previewAlt')}
                  className="max-h-[68vh] object-contain"
                  onLoad={() => {
                    // Start on the largest crop the constraint allows, centred;
                    // with no constraint, the whole image.
                    const image = imgRef.current;
                    if (crop || !image) return;
                    applyCrop(
                      currentAspectRatio
                        ? centeredAspectCrop(image, currentAspectRatio)
                        : { unit: '%', width: 100, height: 100, x: 0, y: 0 }
                    );
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

          {config.aspectRatioBounds && (
            <div className="flex flex-col gap-2">
              <label htmlFor={sliderId} className="text-body-emphasis">
                {t('imageCrop.aspectRatio.label', {
                  ratio: (selectedAspectRatio ?? config.aspectRatioBounds.min).toFixed(1),
                })}
              </label>
              <input
                id={sliderId}
                type="range"
                min={config.aspectRatioBounds.min}
                max={config.aspectRatioBounds.max}
                step={0.1}
                value={selectedAspectRatio ?? config.aspectRatioBounds.min}
                onChange={e => {
                  const ratio = Number(e.target.value);
                  setSelectedAspectRatio(ratio);
                  config.onAspectRatioChange?.(ratio);
                  const image = imgRef.current;
                  if (image) applyCrop(centeredAspectCrop(image, ratio));
                }}
                aria-valuetext={t('imageCrop.aspectRatio.ariaLabel', {
                  ratio: (selectedAspectRatio ?? config.aspectRatioBounds.min).toFixed(1),
                })}
                className="w-full accent-primary"
              />
              <div className="flex justify-between">
                <span className="text-caption text-muted-foreground">{t('imageCrop.aspectRatio.hintLeft')}</span>
                <span className="text-caption text-muted-foreground">{t('imageCrop.aspectRatio.hintRight')}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor={altTextId} className="text-body-emphasis">
              {altTextLabel}
            </label>
            <Input
              id={altTextId}
              value={altText}
              onChange={e => setAltText(e.target.value)}
              placeholder={altTextPlaceholder}
            />
          </div>
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
