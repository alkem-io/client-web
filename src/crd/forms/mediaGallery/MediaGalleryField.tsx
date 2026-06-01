import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { GripVertical, ImagePlus, X } from 'lucide-react';
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

function SortableTile({
  id,
  preview,
  altText,
  disabled,
  dragLabel,
  deleteLabel,
  onDelete,
}: {
  id: string;
  preview: string | undefined;
  altText: string | undefined;
  disabled: boolean;
  dragLabel: string;
  deleteLabel: string;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      className={cn(
        'group/mgtile relative aspect-square rounded-md overflow-hidden border border-border bg-muted/30',
        isDragging && 'opacity-50 z-10'
      )}
    >
      {preview && (
        <img
          src={preview}
          alt={altText ?? ''}
          draggable={false}
          className="w-full h-full object-cover pointer-events-none select-none"
        />
      )}
      <button
        type="button"
        {...listeners}
        {...attributes}
        disabled={disabled}
        className="absolute top-1 left-1 size-6 rounded-full bg-background/90 border border-border shadow-sm flex items-center justify-center opacity-0 group-hover/mgtile:opacity-100 focus-visible:opacity-100 transition-opacity cursor-grab touch-none text-muted-foreground hover:text-foreground disabled:cursor-default disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={dragLabel}
      >
        <GripVertical className="size-3.5" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="absolute top-1 right-1 size-6 rounded-full bg-background/90 border border-border shadow-sm flex items-center justify-center opacity-0 group-hover/mgtile:opacity-100 focus-visible:opacity-100 transition-opacity text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        disabled={disabled}
        onClick={onDelete}
        aria-label={deleteLabel}
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

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

  // Object URLs are created once per File, kept in component state so they
  // trigger a re-render on creation, and revoked when the file is removed or
  // the component unmounts. (Earlier this lived in a ref, which never
  // re-rendered after the first paint — the user saw a blank tile until some
  // unrelated state change refreshed the view.)
  const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(() => new Map());
  // Mirror of the latest map for the unmount cleanup. Refs survive across renders
  // and let the cleanup revoke whatever URLs are live at the moment of unmount,
  // without re-running the effect on every state change (which would revoke
  // in-flight previews).
  const previewUrlsRef = useRef(previewUrls);
  previewUrlsRef.current = previewUrls;
  useEffect(() => {
    setPreviewUrls(prev => {
      const liveKeys = new Set<string>();
      let next: Map<string, string> | null = null;
      const ensureNext = () => {
        if (!next) next = new Map(prev);
        return next;
      };
      for (const visual of visuals) {
        if (!visual.file) continue;
        const key = visualKey(visual);
        liveKeys.add(key);
        if (!prev.has(key)) ensureNext().set(key, window.URL.createObjectURL(visual.file));
      }
      for (const [key, url] of prev) {
        if (!liveKeys.has(key)) {
          window.URL.revokeObjectURL(url);
          ensureNext().delete(key);
        }
      }
      return next ?? prev;
    });
  }, [visuals]);
  useEffect(() => {
    return () => {
      for (const url of previewUrlsRef.current.values()) URL.revokeObjectURL(url);
    };
  }, []);

  const sorted = [...visuals].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const itemIds = sorted.map(visualKey);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Reorder the displayed list and renumber every entry's sortOrder to its new
  // index. Renumbering the whole list (not just the moved item) keeps the
  // edit-mode diff against the server's originalSortOrders correct — the upload
  // hook deletes + re-adds visuals whose sortOrder changed.
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = itemIds.indexOf(String(active.id));
    const newIndex = itemIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...sorted];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    onVisualsChange(reordered.map((visual, index) => ({ ...visual, sortOrder: index })));
  };

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
    if (visual.file) return previewUrls.get(visualKey(visual));
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={itemIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {sorted.map(visual => {
                const key = visualKey(visual);
                return (
                  <SortableTile
                    key={key}
                    id={key}
                    preview={getPreviewUrl(visual)}
                    altText={visual.altText}
                    disabled={disabled || uploading}
                    dragLabel={t('mediaGallery.reorderImage')}
                    deleteLabel={t('mediaGallery.deleteImage')}
                    onDelete={() => handleDelete(visual)}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
