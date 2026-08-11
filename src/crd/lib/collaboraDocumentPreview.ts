import { FileText, FileType, Presentation, Sheet } from 'lucide-react';

export type CollaboraDocumentPreviewType = 'text' | 'spreadsheet' | 'presentation' | 'pdf';

export const iconByType: Record<CollaboraDocumentPreviewType, typeof FileText> = {
  text: FileText,
  spreadsheet: Sheet,
  presentation: Presentation,
  // Distinct from the other three so a PDF is recognizable at a glance (FR-007).
  pdf: FileType,
};

/** Type-differentiated accent color, applied everywhere a Collabora document
 *  type-icon is rendered, so a Doc/Sheet/Slide/PDF is recognisable at a glance. */
export const colorByType: Record<CollaboraDocumentPreviewType, string> = {
  text: 'text-blue-600',
  spreadsheet: 'text-green-600',
  presentation: 'text-orange-600',
  pdf: 'text-red-600',
};

/** Label shown on the preview badge — 'text' uses the generic "Document" label
 *  (`callout.document`, shared with the post-type label) rather than
 *  `callout.documentText` ("Text Document"), which is reserved for the
 *  create-new document-type picker (`CollaboraDocumentTypePicker`). */
export const typeLabelKey: Record<CollaboraDocumentPreviewType, string> = {
  text: 'callout.document',
  spreadsheet: 'callout.documentSpreadsheet',
  presentation: 'callout.documentPresentation',
  pdf: 'callout.documentPdf',
};
