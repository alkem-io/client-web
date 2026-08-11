import { FileText, Presentation, Sheet } from 'lucide-react';

export type CollaboraDocumentPreviewType = 'text' | 'spreadsheet' | 'presentation';

export const iconByType: Record<CollaboraDocumentPreviewType, typeof FileText> = {
  text: FileText,
  spreadsheet: Sheet,
  presentation: Presentation,
};

/** Type-differentiated accent color, applied everywhere a Collabora document
 *  type-icon is rendered, so a Doc/Sheet/Slide is recognisable at a glance. */
export const colorByType: Record<CollaboraDocumentPreviewType, string> = {
  text: 'text-blue-600',
  spreadsheet: 'text-green-600',
  presentation: 'text-orange-600',
};

/** Label shown on the preview badge — 'text' uses the generic "Document" label
 *  (`callout.document`, shared with the post-type label) rather than
 *  `callout.documentText` ("Text Document"), which is reserved for the
 *  create-new document-type picker (`CollaboraDocumentTypePicker`). */
export const typeLabelKey: Record<CollaboraDocumentPreviewType, string> = {
  text: 'callout.document',
  spreadsheet: 'callout.documentSpreadsheet',
  presentation: 'callout.documentPresentation',
};
