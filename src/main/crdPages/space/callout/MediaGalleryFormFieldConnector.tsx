import { useDefaultVisualTypeConstraintsQuery } from '@/core/apollo/generated/apollo-hooks';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { MediaGalleryField, type MediaGalleryFieldVisual } from '@/crd/forms/mediaGallery/MediaGalleryField';

type MediaGalleryFormFieldConnectorProps = {
  visuals: MediaGalleryFieldVisual[];
  onVisualsChange: (next: MediaGalleryFieldVisual[]) => void;
  disabled?: boolean;
  uploading?: boolean;
};

/**
 * Integration wrapper around `MediaGalleryField`. Supplies client-side validation
 * constraints from the platform's default visual-type-constraints query. Upload
 * persistence is handled at the callout-form level (post-save) via
 * `useUploadMediaGalleryVisuals`, not here — this connector only validates the
 * files the user picks and keeps them in the form state until submit.
 */
export function MediaGalleryFormFieldConnector({
  visuals,
  onVisualsChange,
  disabled,
  uploading,
}: MediaGalleryFormFieldConnectorProps) {
  const { data } = useDefaultVisualTypeConstraintsQuery({
    variables: { visualType: VisualType.MediaGalleryImage },
  });

  const rawConstraints = data?.platform.configuration.defaultVisualTypeConstraints;
  const constraints = rawConstraints
    ? {
        allowedMimeTypes: rawConstraints.allowedTypes ?? undefined,
        minWidth: rawConstraints.minWidth ?? undefined,
        minHeight: rawConstraints.minHeight ?? undefined,
        maxWidth: rawConstraints.maxWidth ?? undefined,
        maxHeight: rawConstraints.maxHeight ?? undefined,
      }
    : undefined;

  return (
    <MediaGalleryField
      visuals={visuals}
      onVisualsChange={onVisualsChange}
      constraints={constraints}
      disabled={disabled}
      uploading={uploading}
    />
  );
}
