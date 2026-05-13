import { useEffect, useState } from 'react';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import type { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';

/**
 * Converts the largest preview blob from a `WhiteboardPreviewImage[]` into an
 * object URL suitable for an `<img src>` thumbnail, with cleanup on unmount /
 * blob change. Mirrors MUI's `FormikWhiteboardPreview` (which renders an
 * inline Excalidraw) without bundling Excalidraw into the form path — the
 * preview blob is generated once when the user saves the single-user
 * whiteboard dialog and reused as a static thumbnail thereafter.
 *
 * Preference order: `WhiteboardPreview` (the bigger, default-generated image)
 * → `Card` → first available blob. Returns `undefined` when no images exist
 * yet (the user hasn't opened the editor yet) — the consumer should fall back
 * to a placeholder.
 */
export function useWhiteboardPreviewBlobUrl(images: WhiteboardPreviewImage[] | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!images || images.length === 0) {
      setUrl(undefined);
      return;
    }
    const preferred =
      images.find(img => img.visualType === VisualType.WhiteboardPreview) ??
      images.find(img => img.visualType === VisualType.Card) ??
      images[0];
    if (!preferred?.imageData) {
      setUrl(undefined);
      return;
    }
    const nextUrl = URL.createObjectURL(preferred.imageData);
    setUrl(nextUrl);
    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [images]);

  return url;
}
