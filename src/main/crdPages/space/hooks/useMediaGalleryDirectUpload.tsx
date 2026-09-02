import { type ChangeEvent, type ReactNode, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDefaultVisualTypeConstraintsQuery } from '@/core/apollo/generated/apollo-hooks';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { validateMediaFile } from '@/crd/forms/mediaGallery/validateMediaFile';
import useUploadMediaGalleryVisuals from '@/domain/collaboration/mediaGallery/useUploadMediaGalleryVisuals';

type UseMediaGalleryDirectUploadParams = {
  /** Media-gallery id from the callout's framing. Uploads are no-ops when undefined. */
  mediaGalleryId: string | undefined;
  /** Existing visuals; used to compute the next sortOrder. */
  existingVisuals: ReadonlyArray<{ sortOrder?: number | null }>;
  /** When false, the picker is suppressed and the trigger callback is undefined. */
  enabled: boolean;
};

type UseMediaGalleryDirectUploadResult = {
  /** Click handler — opens the OS file picker. `undefined` when disabled. */
  triggerAddImages: (() => void) | undefined;
  /** Hidden `<input type="file">` element to mount once per host. */
  fileInputElement: ReactNode;
  uploading: boolean;
};

/**
 * Shared "Add images directly to an existing media gallery" upload flow used
 * both by `LazyCalloutItem` (feed PostCard) and `MediaGalleryFramingConnector`
 * (detail-dialog carousel). Mirrors MUI's behaviour where clicking the +
 * affordance goes straight to the file picker — no edit-dialog round-trip.
 *
 * Validation reuses `validateMediaFile` against the platform's
 * `defaultVisualTypeConstraints` so the rules match the create-form path.
 * Rejects surface as `mediaGallery.validation.*` notifications. Accepted files
 * are uploaded via `useUploadMediaGalleryVisuals`, which already refetches
 * `CalloutDetails` so the new images appear inline.
 */
export function useMediaGalleryDirectUpload({
  mediaGalleryId,
  existingVisuals,
  enabled,
}: UseMediaGalleryDirectUploadParams): UseMediaGalleryDirectUploadResult {
  const { t } = useTranslation('crd-space');
  const notify = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: constraintsData } = useDefaultVisualTypeConstraintsQuery({
    variables: { visualType: VisualType.MediaGalleryImage },
    skip: !enabled,
  });
  const rawConstraints = constraintsData?.platform.configuration.defaultVisualTypeConstraints;
  const constraints = rawConstraints
    ? {
        allowedMimeTypes: rawConstraints.allowedTypes ?? undefined,
        minWidth: rawConstraints.minWidth ?? undefined,
        minHeight: rawConstraints.minHeight ?? undefined,
        maxWidth: rawConstraints.maxWidth ?? undefined,
        maxHeight: rawConstraints.maxHeight ?? undefined,
      }
    : undefined;
  const acceptAttr = constraints?.allowedMimeTypes?.length ? constraints.allowedMimeTypes.join(',') : 'image/*';

  const { uploadMediaGalleryVisuals, uploading } = useUploadMediaGalleryVisuals();

  const nextSortOrder = existingVisuals.reduce((max, v) => Math.max(max, v.sortOrder ?? 0), 0) + 1;
  const canTrigger = enabled && Boolean(mediaGalleryId) && !uploading;

  const triggerAddImages = canTrigger ? () => fileInputRef.current?.click() : undefined;

  const handleFilesSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!mediaGalleryId || files.length === 0) return;

    const accepted: { file: File; sortOrder: number }[] = [];
    let order = nextSortOrder;
    for (const file of files) {
      const result = await validateMediaFile(file, constraints);
      if (result.ok) {
        accepted.push({ file, sortOrder: order++ });
      } else {
        notify(t(`mediaGallery.validation.${result.reason}`, { fileName: file.name }), 'warning');
      }
    }
    if (accepted.length === 0) return;

    try {
      await uploadMediaGalleryVisuals({
        mediaGalleryId,
        visuals: accepted.map(a => ({
          file: a.file,
          altText: a.file.name.replace(/\.[^.]+$/, ''),
          sortOrder: a.sortOrder,
        })),
      });
    } catch (err) {
      logError(new Error('Media gallery direct upload failed', { cause: err as Error }));
      notify(t('callout.uploadAfterCreateFailed'), 'error');
    }
  };

  const fileInputElement = enabled ? (
    <input
      ref={fileInputRef}
      type="file"
      accept={acceptAttr}
      multiple={true}
      disabled={uploading}
      onChange={event => void handleFilesSelected(event)}
      className="sr-only"
      tabIndex={-1}
      aria-hidden="true"
    />
  ) : null;

  return { triggerAddImages, fileInputElement, uploading };
}
