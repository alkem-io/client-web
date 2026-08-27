import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactCrop, {
  type Crop,
  clamp,
  convertToPercentCrop,
  convertToPixelCrop,
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
  /**
   * Refuse to save a crop smaller than `minWidth`/`minHeight` instead of letting
   * the resizer upscale it.
   *
   * Off by default, and deliberately opt-in: the resizer's upscale path is the
   * long-standing behaviour for every consumer of this dialog (avatars, card
   * banners, chat photos), and turning the check into a hard block for all of
   * them would silently make small-but-valid uploads unsaveable with no recourse
   * but Cancel. The warning below shows either way.
   */
  blockBelowMinSize?: boolean;
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
  /** Alt text the visual already has, so re-cropping does not silently blank it. */
  initialAltText?: string;
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
 * All crop geometry here is done in **displayed pixels**, never in `%`.
 *
 * A percent crop has two bases — `width` is a share of the box width, `height` a
 * share of the box height — so `height = width / ratio` in percent space is only
 * correct on a square image and silently skews every other one. Working in px
 * removes that trap entirely; the `%` conversion happens once, at the edge.
 */

/** The largest `ratio`-shaped rectangle that fits inside the displayed image. */
function maxCropSize(image: HTMLImageElement, ratio: number): { width: number; height: number } {
  return image.width / image.height > ratio
    ? { width: image.height * ratio, height: image.height }
    : { width: image.width, height: image.width / ratio };
}

/** The whole image, for when no aspect-ratio constraint applies. */
export function fullImageCrop(image: HTMLImageElement): PixelCrop {
  return { unit: 'px', x: 0, y: 0, width: image.width, height: image.height };
}

/** Centred crop at the largest size `ratio` allows — the opening state. */
export function centeredAspectCrop(image: HTMLImageElement, ratio: number): PixelCrop {
  const { width, height } = maxCropSize(image, ratio);
  return { unit: 'px', width, height, x: (image.width - width) / 2, y: (image.height - height) / 2 };
}

/**
 * Reshape an existing crop to `ratio`, keeping the framing the user chose: same
 * centre point, and the same size *relative to the largest crop the ratio
 * allows*.
 *
 * Preserving the size as a **fraction of the maximum** rather than as absolute
 * pixels is what makes this reversible. Carrying the width over literally would
 * force a clamp whenever the new shape no longer fits, and clamping only ever
 * shrinks — so sliding the ratio out and back would ratchet the crop smaller
 * every trip and never restore it. A fraction survives the round trip exactly:
 * out to 10 and back to 6 returns the size it started at.
 *
 * The centre can still drift when the reshaped crop has to be pushed off an
 * edge, which is unavoidable — the alternative is letting it hang outside the
 * image, and the canvas encodes anything outside the bitmap as black bars.
 */
export function reshapeCropToAspect(image: HTMLImageElement, previous: PixelCrop, ratio: number): PixelCrop {
  if (!previous.width || !previous.height) return centeredAspectCrop(image, ratio);

  const previousMax = maxCropSize(image, previous.width / previous.height);
  const scale = previousMax.width ? Math.min(1, previous.width / previousMax.width) : 1;

  const max = maxCropSize(image, ratio);
  const width = max.width * scale;
  const height = max.height * scale;

  return {
    unit: 'px',
    width,
    height,
    x: clamp(previous.x + previous.width / 2 - width / 2, 0, image.width - width),
    y: clamp(previous.y + previous.height / 2 - height / 2, 0, image.height - height),
  };
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
  return Math.min(Math.max(aspectRatio ?? aspectRatioBounds.max, aspectRatioBounds.min), aspectRatioBounds.max);
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
  initialAltText = '',
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
  const [altText, setAltText] = useState(initialAltText);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | undefined>(() => initialAspectRatio(config));
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgSrc, setImgSrc] = useState<string>('');

  // Drop the previous file's editing state as soon as a new file arrives, so
  // the dialog never shows the old crop while the new preview loads.
  //
  // The previous file is held in state rather than a ref: React may discard a
  // render and replay it, and a ref written during render keeps the new value
  // across that replay, so the resets would be skipped on the render that
  // actually commits. State and the resets commit together.
  const [prevFile, setPrevFile] = useState<File | undefined>(undefined);
  if (file !== prevFile) {
    setPrevFile(file);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setAltText(initialAltText);
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
  // turns a too-small source into an interpolated image that passes server
  // validation but looks soft. Always say so; only refuse the save where the
  // consumer asked for it (`blockBelowMinSize`), since for everything else the
  // upscale is the behaviour that has always shipped.
  const cropSize = naturalCropSize(imgRef.current, completedCrop);
  const requiredWidth = config.minWidth ?? 0;
  const requiredHeight = config.minHeight ?? 0;
  const tooSmall = Boolean(cropSize && (cropSize.width < requiredWidth || cropSize.height < requiredHeight));
  const blockSave = tooSmall && Boolean(config.blockBelowMinSize);

  const currentAspectRatio = selectedAspectRatio ?? config.aspectRatio;

  // A local const (not `config.aspectRatioBounds` inline) so the narrowing from
  // the JSX guard below carries into the slider's onChange closure.
  const aspectRatioBounds = config.aspectRatioBounds;
  /**
   * The slider runs `max → min` left-to-right (10:1 slim strip on the left,
   * 6:1 on the right), while the DOM range input itself must stay ascending —
   * so the rendered value is mirrored around the bounds' midpoint and mirrored
   * back on change. Rounded to the 0.1 step so the mirror arithmetic never
   * drifts the value off the input's step grid (or past the DB's numeric(3,1)).
   * `aria-valuetext` announces the real ratio, so AT hears what sighted users
   * see.
   */
  const mirrorAspectRatio = (value: number) =>
    aspectRatioBounds ? Math.round((aspectRatioBounds.min + aspectRatioBounds.max - value) * 10) / 10 : value;

  // `onComplete` fires only on pointer/keyboard interaction with the crop box
  // (plus the very first undefined → crop transition — see `componentDidUpdate`
  // in react-image-crop). A programmatic crop change must therefore set
  // `completedCrop` itself: it is the only value Save and the too-small check
  // read, so leaving it stale saves the pre-slider crop under the post-slider
  // ratio, and the visual is then rendered at a ratio its pixels don't have.
  const applyCrop = (next: PixelCrop) => {
    const image = imgRef.current;
    if (!image) return;
    // `crop` stays in `%` so it survives the image being re-laid out (a window
    // resize would strand pixel values); `completedCrop` is what Save reads and
    // is always displayed pixels.
    setCrop(convertToPercentCrop(next, image.width, image.height));
    setCompletedCrop(next);
  };

  const handleSave = async () => {
    if (!imgRef.current || !completedCrop || blockSave) return;
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
                // Second argument, not the first: `onChange` hands over
                // (PixelCrop, PercentCrop) in that order, and `crop` has to stay
                // in `%` for the reason `applyCrop` documents — a drag that wrote
                // displayed pixels here would be stranded by the next re-layout,
                // since react-image-crop v10 does not rescale it itself.
                // `completedCrop` is the pixel one, which is what Save reads.
                onChange={(_, percentCrop) => setCrop(percentCrop)}
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
                      currentAspectRatio ? centeredAspectCrop(image, currentAspectRatio) : fullImageCrop(image)
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

          {aspectRatioBounds && (
            <div className="flex flex-col gap-2">
              <label htmlFor={sliderId} className="text-body-emphasis">
                {t('imageCrop.aspectRatio.label', {
                  ratio: (selectedAspectRatio ?? aspectRatioBounds.max).toFixed(1),
                })}
              </label>
              <input
                id={sliderId}
                // The visible <label> carries the live value, which makes it a
                // moving target as an accessible name — AT would re-announce the
                // whole name on every arrow key and never say what the control
                // actually is. A static name here wins over the label element;
                // the value is announced separately via `aria-valuetext`.
                aria-label={t('imageCrop.aspectRatio.name')}
                type="range"
                min={aspectRatioBounds.min}
                max={aspectRatioBounds.max}
                step={0.1}
                // Mirrored: thumb at the left edge = `max` (10), right edge =
                // `min` (6) — see `mirrorAspectRatio`.
                value={mirrorAspectRatio(selectedAspectRatio ?? aspectRatioBounds.max)}
                onChange={e => {
                  const ratio = mirrorAspectRatio(Number(e.target.value));
                  setSelectedAspectRatio(ratio);
                  config.onAspectRatioChange?.(ratio);
                  // Reshape what the user already framed rather than starting
                  // over — `crop` (not `completedCrop`) because it is the live
                  // value, updated on every drag rather than only on release.
                  const image = imgRef.current;
                  if (!image) return;
                  const previous = crop && convertToPixelCrop(crop, image.width, image.height);
                  applyCrop(previous ? reshapeCropToAspect(image, previous, ratio) : centeredAspectCrop(image, ratio));
                }}
                aria-valuetext={t('imageCrop.aspectRatio.ariaLabel', {
                  ratio: (selectedAspectRatio ?? aspectRatioBounds.max).toFixed(1),
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
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !completedCrop || blockSave}
            aria-busy={saving}
          >
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

  // Round to integers to match validation bounds and avoid truncation during
  // canvas coercion, then hold the rectangle inside the bitmap. Origin and
  // extent round independently, so both can round up and put `x + width` a pixel
  // past `naturalWidth`; `drawImage` renders that overhang as transparent black,
  // which the JPEG encoder bakes in as an opaque black edge on the saved image.
  const sourceX = Math.max(0, Math.min(Math.round(crop.x * scaleX), image.naturalWidth));
  const sourceY = Math.max(0, Math.min(Math.round(crop.y * scaleY), image.naturalHeight));
  const sourceWidth = Math.min(Math.round(crop.width * scaleX), image.naturalWidth - sourceX);
  const sourceHeight = Math.min(Math.round(crop.height * scaleY), image.naturalHeight - sourceY);

  canvas.width = sourceWidth;
  canvas.height = sourceHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);

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
      // Must match the `toBlob` quality above: the resizer re-encodes, so a
      // higher value here just inflates the file the 0.92 pass deliberately
      // kept small, without recovering detail that encode already discarded.
      92,
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
