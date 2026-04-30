import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import type { CollaboraDocumentPreviewType } from '@/crd/components/callout/CalloutCollaboraPreview';

const map: Record<CollaboraDocumentType, CollaboraDocumentPreviewType> = {
  [CollaboraDocumentType.Wordprocessing]: 'text',
  [CollaboraDocumentType.Spreadsheet]: 'spreadsheet',
  [CollaboraDocumentType.Presentation]: 'presentation',
  // Drawing isn't surfaced in the type picker yet; treat it as a generic
  // text document so the preview falls back to the FileText icon.
  [CollaboraDocumentType.Drawing]: 'text',
};

export function toCollaboraPreviewType(
  documentType: CollaboraDocumentType | string | undefined
): CollaboraDocumentPreviewType {
  return map[documentType as CollaboraDocumentType] ?? 'text';
}
