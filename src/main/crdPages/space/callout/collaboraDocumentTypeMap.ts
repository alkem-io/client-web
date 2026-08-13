import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import type { CollaboraDocumentPreviewType } from '@/crd/components/callout/CalloutCollaboraPreview';

const map: Record<CollaboraDocumentType, CollaboraDocumentPreviewType> = {
  [CollaboraDocumentType.Wordprocessing]: 'text',
  [CollaboraDocumentType.Spreadsheet]: 'spreadsheet',
  [CollaboraDocumentType.Presentation]: 'presentation',
  // Drawing isn't surfaced in the type picker yet; treat it as a generic
  // text document so the preview falls back to the FileText icon.
  [CollaboraDocumentType.Drawing]: 'text',
  // PDF isn't surfaced in the type picker or the P1 upload accept list
  // (collaboraImportFormats.ts) yet either; same generic-text fallback as
  // Drawing until a first-class PDF surface exists.
  //
  // It also cannot be a key here yet: `CollaboraDocumentType` has no PDF member
  // in the server schema this client is generated against (alkem-io/server#6351,
  // which adds it, is still a draft PR). The `?? 'text'` fallback below already
  // yields the identical generic-text preview for a PDF documentType, and this
  // exhaustive Record will stop compiling — forcing the entry back — the moment
  // the server enum gains PDF.
};

export function toCollaboraPreviewType(
  documentType: CollaboraDocumentType | string | undefined
): CollaboraDocumentPreviewType {
  return map[documentType as CollaboraDocumentType] ?? 'text';
}
