import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import type { CollaboraDocumentPreviewType } from '@/crd/components/callout/CalloutCollaboraPreview';

const map: Record<CollaboraDocumentType, CollaboraDocumentPreviewType> = {
  [CollaboraDocumentType.TextDocument]: 'text',
  [CollaboraDocumentType.Spreadsheet]: 'spreadsheet',
  [CollaboraDocumentType.Presentation]: 'presentation',
};

export function toCollaboraPreviewType(
  documentType: CollaboraDocumentType | string | undefined
): CollaboraDocumentPreviewType {
  return map[documentType as CollaboraDocumentType] ?? 'text';
}
