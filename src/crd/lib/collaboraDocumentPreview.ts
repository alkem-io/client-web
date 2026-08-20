import { FileText, FileType, Presentation, Sheet } from 'lucide-react';

export type CollaboraDocumentPreviewType = 'text' | 'spreadsheet' | 'presentation' | 'pdf';

export const iconByType: Record<CollaboraDocumentPreviewType, typeof FileText> = {
  text: FileText,
  spreadsheet: Sheet,
  presentation: Presentation,
  // Distinct from the other three so a PDF is recognizable at a glance.
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

export type CollaboraOpenLabelKey = 'callout.openDocument' | 'callout.openDocumentPdf';

/** i18n key for the primary "open" action's label, shared across every surface
 *  that opens a Collabora document (preview card, framing overlay, contribution
 *  overlay). Every type reads "Open Document" except PDF, which reads "View" —
 *  it has no create/edit concept (import-only) and is currently view-only, not
 *  view/annotate: annotating a PDF and letting Collabora save it corrupts the
 *  document (a Collabora background-save bug, not ours) — wopi-service forces
 *  PDF WOPI tokens read-only until that's fixed upstream. */
export const openLabelKey: Record<CollaboraDocumentPreviewType, CollaboraOpenLabelKey> = {
  text: 'callout.openDocument',
  spreadsheet: 'callout.openDocument',
  presentation: 'callout.openDocument',
  pdf: 'callout.openDocumentPdf',
};
