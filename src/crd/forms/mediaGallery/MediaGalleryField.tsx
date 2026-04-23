import { ImagePlus, X } from 'lucide-react';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { type MediaFileConstraints, validateMediaFile } from './validateMediaFile';

export type MediaGalleryFieldVisual = {
  id?: string;
  file?: File;
  uri?: string;
  altText?: string;
  sortOrder?: number;
  /** Client-generated id for unsaved (file-only) entries so React keys stay stable before upload. */
  clientKey?: string;
};

const visualKey = (visual: MediaGalleryFieldVisual): string =>
  visual.id ?? visual.clientKey ?? `${visual.sortOrder ?? 0}`;

type MediaGalleryFieldProps = {
  visuals: MediaGalleryFieldVisual[];
  onVisualsChange: (next: MediaGalleryFieldVisual[]) => void;
  constraints?: MediaFileConstraints;
  disabled?: boolean;
  uploading?: boolean;
  className?: string;
};

type FieldError = { key: string; fileName: string; reason: 'type' | 'tooSmall' | 'tooLarge' };

const generateClientKey = (): string =>
  `mg-client-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function MediaGalleryField({
  visuals,
  onVisualsChange,
  constraints,
  disabled = false,
  uploading = false,
  className,
}: MediaGalleryFieldProps) {
  const { t } = useTranslation('crd-space');
  const inputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<FieldError[]>([]);

  // Object URLs are created once per File and revoked when the file is removed or the
  // component unmounts. Creating them in render would leak a fresh blob URL on every
  // re-render. Keyed by the visual's stable client/server key.
  const previewUrlsRef = useRef(new Map<string, string>());
  useEffect(() => {
    const cache = previewUrlsRef.current;
    const liveKeys = new Set<string>();
    for (const visual of visuals) {
      if (!visual.file) continue;
      const key = visualKey(visual);
      liveKeys.add(key);
      if (!cache.has(key)) cache.set(key, window.URL.createObjectURL(visual.file));
    }
    for (const [key, url] of cache) {
      if (!liveKeys.has(key)) {
        window.URL.revokeObjectURL(url);
        cache.delete(key);
      }
    }
  }, [visuals]);
  useEffect(() => {
    const cache = previewUrlsRef.current;
    return () => {
      for (const url of cache.values()) URL.revokeObjectURL(url);
      cache.clear();
    };
  }, []);

  const sorted = [...visuals].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const nextSortOrder = (): number => {
    const max = visuals.reduce((m, v) => Math.max(m, v.sortOrder ?? 0), 0);
    return max + 1;
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    const newErrors: FieldError[] = [];
    const accepted: MediaGalleryFieldVisual[] = [];
    let nextOrder = nextSortOrder();

    for (const file of files) {
      const result = await validateMediaFile(file, constraints);
      if (!result.ok) {
        newErrors.push({
          key: `${file.name}-${Date.now()}-${Math.random()}`,
          fileName: file.name,
          reason: result.reason,
        });
        continue;
      }
      accepted.push({
        file,
        altText: file.name.replace(/\.[^.]+$/, ''),
        sortOrder: nextOrder++,
        clientKey: generateClientKey(),
      });
    }

    setErrors(newErrors);
    if (accepted.length > 0) {
      onVisualsChange([...visuals, ...accepted]);
    }
  };

  const handleDelete = (visual: MediaGalleryFieldVisual) => {
    const key = visual.id ?? visual.clientKey;
    // Without a key the visual is not uniquely identifiable — bail out rather
    // than risk deleting every other keyless entry that shares `undefined`.
    if (!key) return;
    const next = visuals.filter(v => (v.id ?? v.clientKey) !== key);
    onVisualsChange(next);
  };

  const getPreviewUrl = (visual: MediaGalleryFieldVisual): string | undefined => {
    if (visual.file) return previewUrlsRef.current.get(visualKey(visual));
    return visual.uri;
  };

  const dismissError = (errorKey: string) => {
    setErrors(prev => prev.filter(e => e.key !== errorKey));
  };

  const acceptAttr = constraints?.allowedMimeTypes?.length ? constraints.allowedMimeTypes.join(',') : 'image/*';

  return (
    <div className={cn('space-y-3', className)}>
      {/* Upload trigger */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={acceptAttr}
          multiple={true}
          disabled={disabled || uploading}
          onChange={handleFileSelect}
          className="sr-only"
          tabIndex={-1}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="size-4" aria-hidden="true" />
          {t('mediaGallery.emptyState.action')}
        </Button>
        {uploading && <span className="text-caption text-muted-foreground">{t('mediaGallery.uploading')}</span>}
      </div>

      {/* Inline validation errors */}
      {errors.length > 0 && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-3 space-y-1">
          {errors.map(err => (
            <div key={err.key} className="flex items-center justify-between gap-2 text-caption text-destructive">
              <span>
                <strong className="font-semibold">{err.fileName}</strong> — {t(`mediaGallery.validation.${err.reason}`)}
              </span>
              <button
                type="button"
                className="text-destructive/80 hover:text-destructive"
                onClick={() => dismissError(err.key)}
                aria-label={t('mediaGallery.dismissError')}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tile grid */}
      {sorted.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {sorted.map(visual => {
            const key = visualKey(visual);
            const preview = getPreviewUrl(visual);
            return (
              <div
                key={key}
                className="group/mgtile relative aspect-square rounded-md overflow-hidden border border-border bg-muted/30"
              >
                {preview && (
                  <img
                    src={preview}
                    alt={visual.altText ?? ''}
                    draggable={false}
                    className="w-full h-full object-cover pointer-events-none select-none"
                  />
                )}
                <button
                  type="button"
                  className="absolute top-1 right-1 size-6 rounded-full bg-background/90 border border-border shadow-sm flex items-center justify-center opacity-0 group-hover/mgtile:opacity-100 focus-visible:opacity-100 transition-opacity text-destructive hover:bg-destructive hover:text-destructive-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={disabled || uploading}
                  onClick={() => handleDelete(visual)}
                  aria-label={t('mediaGallery.deleteImage')}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
