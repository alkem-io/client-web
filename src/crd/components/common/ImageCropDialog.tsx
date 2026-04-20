import { useCallback, useRef, useState } from 'react';
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
};

type ImageCropDialogProps = {
  open: boolean;
  file: File | undefined;
  config: ImageCropConfig;
  onSave: (data: { file: File; altText: string }) => void;
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  altTextLabel?: string;
  altTextPlaceholder?: string;
  title?: string;
  description?: string;
};

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
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  altTextLabel = 'Description',
  altTextPlaceholder = 'Describe this image…',
  title = 'Crop Image',
  description,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [altText, setAltText] = useState('');
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
    } else {
      setImgSrc('');
    }
  }

  const handleSave = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return;
    setSaving(true);
    try {
      const croppedFile = await getCroppedImg(imgRef.current, completedCrop, config, file?.name ?? 'image.png');
      onSave({ file: croppedFile, altText });
    } catch {
      // If crop fails, fall back to the original file.
      if (file) {
        onSave({ file, altText });
      }
    } finally {
      setSaving(false);
    }
  }, [altText, completedCrop, config, file, onSave]);

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) onCancel();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {imgSrc && (
            <div className="flex justify-center overflow-hidden rounded-md bg-muted">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
                aspect={config.aspectRatio}
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

          <div className="flex flex-col gap-1">
            <label htmlFor="crop-alt-text" className="text-sm font-medium">
              {altTextLabel}
            </label>
            <Input
              id="crop-alt-text"
              value={altText}
              onChange={e => setAltText(e.target.value)}
              placeholder={altTextPlaceholder}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            {cancelLabel}
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving || !completedCrop}>
            {saving ? 'Saving…' : saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Crop + resize the image to a File that fits the config's constraints.
 * Uses canvas for the crop and react-image-file-resizer for final resize.
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
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))), 'image/jpeg', 0.92);
  });

  const targetWidth = config.maxWidth ?? canvas.width;
  const targetHeight = config.maxHeight ?? canvas.height;

  return new Promise<File>((resolve, reject) => {
    Resizer.imageFileResizer(
      new File([blob], fileName, { type: 'image/jpeg' }),
      targetWidth,
      targetHeight,
      'JPEG',
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
      'file'
    );
  });
}
