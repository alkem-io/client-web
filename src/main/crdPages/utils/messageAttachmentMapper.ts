import type { MessageAttachment } from '@/crd/components/comment/types';

/** Minimal shape of a GraphQL `MessageAttachment` (feature 013) as selected by
 *  the message documents. Width/height are present for images only. */
type GraphQLMessageAttachment = {
  id: string;
  url: string;
  displayName: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
};

/**
 * Maps the GraphQL `Message.attachments` selection to the plain CRD
 * `MessageAttachment[]` consumed by the render components. `url` is already an
 * authorized Alkemio document URL (web- or Element-origin), so the mapping is a
 * uniform field copy with no origin-specific handling.
 */
export const mapMessageAttachments = (
  attachments: GraphQLMessageAttachment[] | null | undefined
): MessageAttachment[] => {
  if (!attachments?.length) {
    return [];
  }

  return attachments.map(attachment => ({
    id: attachment.id,
    url: attachment.url,
    displayName: attachment.displayName,
    mimeType: attachment.mimeType,
    size: attachment.size,
    width: attachment.width ?? undefined,
    height: attachment.height ?? undefined,
  }));
};
