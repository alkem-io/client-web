import type { useTemplateContentLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import type { CalloutFormValues } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import { calloutTemplateContentToFormValues } from './calloutTemplateMapper';
import { fetchPreviewImageBlob } from './fetchPreviewImageBlob';

type GetTemplateContent = ReturnType<typeof useTemplateContentLazyQuery>[0];

/**
 * Loads a Callout template's full content and maps it to CRD callout-form values.
 *
 * The picker's preview shape is lossy (no poll settings / tags / contribution actors), so this
 * re-fetches the **full** callout content (`includeCallout: true`) and maps it via the same
 * `calloutTemplateContentToFormValues` the Callout-template editor uses, so every framing kind
 * (incl. Collabora-document and poll) round-trips faithfully. When the template carries a
 * server-rendered whiteboard preview, the image is fetched as a `Blob` and seeded onto
 * `whiteboardPreviewImages` so the post-create upload step carries it through to the new callout's
 * `WHITEBOARD_PREVIEW` Visual (D18). A failed image fetch is non-fatal — the blob seed is skipped.
 *
 * Shared by both the manual "Find Template" picker (`TemplateImportConnector`) and the
 * flow-state default-template auto-load (`CalloutFormConnector`, FR-086).
 */
export async function loadCalloutTemplateFormValues(
  getTemplateContent: GetTemplateContent,
  templateId: string
): Promise<Partial<CalloutFormValues> | null> {
  const { data } = await getTemplateContent({ variables: { templateId, includeCallout: true } });
  const callout = data?.lookup.template?.callout;
  if (!callout) return null;

  const values = calloutTemplateContentToFormValues(callout);
  if (values.whiteboardPreviewServerUrl) {
    const blob = await fetchPreviewImageBlob(values.whiteboardPreviewServerUrl);
    if (blob) {
      values.whiteboardPreviewImages = [{ visualType: VisualType.WhiteboardPreview, imageData: blob }];
    }
  }
  return values;
}
