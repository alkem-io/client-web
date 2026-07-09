import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';

/**
 * Maps a Phase-1 OfficeDocs extension to its {@link CollaboraDocumentType}.
 * Used for the client-side **same-type** pre-check on replace (FR-006): the
 * replacement file must map to the same document type as the current document.
 *
 * This is the client's best-effort, extension-based guess — the server still
 * content-sniffs the MIME authoritatively and rejects a mismatch (FR-012),
 * so a mislabelled file is caught there and surfaced as a server error.
 */
const EXTENSION_TO_DOCUMENT_TYPE: Readonly<Record<string, CollaboraDocumentType>> = {
  '.docx': CollaboraDocumentType.Wordprocessing,
  '.xlsx': CollaboraDocumentType.Spreadsheet,
  '.pptx': CollaboraDocumentType.Presentation,
};

export const collaboraDocumentTypeFromFilename = (filename: string): CollaboraDocumentType | undefined => {
  const lastDot = filename.lastIndexOf('.');
  const ext = lastDot < 0 ? '' : filename.slice(lastDot).toLowerCase();
  return EXTENSION_TO_DOCUMENT_TYPE[ext];
};

/**
 * The canonical Phase-1 extension a replacement of a given document type must
 * have — the inverse of {@link EXTENSION_TO_DOCUMENT_TYPE}. Used to narrow the
 * replace dialog's file picker + hint to only the current document's type
 * (since the replacement must match it, FR-006). `undefined` for a type with no
 * Phase-1 extension (e.g. Drawing), in which case the caller falls back to the
 * full allowlist.
 */
const DOCUMENT_TYPE_TO_EXTENSION: Readonly<Partial<Record<CollaboraDocumentType, string>>> = {
  [CollaboraDocumentType.Wordprocessing]: '.docx',
  [CollaboraDocumentType.Spreadsheet]: '.xlsx',
  [CollaboraDocumentType.Presentation]: '.pptx',
};

export const collaboraExtensionForType = (type: CollaboraDocumentType | string): string | undefined =>
  DOCUMENT_TYPE_TO_EXTENSION[type as CollaboraDocumentType];

/**
 * True when a document of this type can be replaced in Phase 1 — i.e. we know a
 * Phase-1 extension for it (the same map that drives the same-type pre-check,
 * FR-006). A type with no Phase-1 extension (e.g. Drawing) is **not** replaceable:
 * every allowed file would fail the same-type check, so the Replace action is
 * suppressed rather than opening a dialog that can only reject.
 */
export const isReplaceableCollaboraDocumentType = (type: CollaboraDocumentType | string): boolean =>
  collaboraExtensionForType(type) !== undefined;

/**
 * i18n key for the human-readable name of a document type, reusing the labels
 * the create-flow type picker already ships. Lets the replace dialog *say what
 * the current document is* (e.g. "Presentation"). `undefined` for an unmapped type.
 */
/** i18n keys for the document-type names (literal union so the typed `t()` accepts them). */
export type CollaboraTypeLabelKey =
  | 'callout.documentText'
  | 'callout.documentSpreadsheet'
  | 'callout.documentPresentation';

const DOCUMENT_TYPE_LABEL_KEY: Readonly<Partial<Record<CollaboraDocumentType, CollaboraTypeLabelKey>>> = {
  [CollaboraDocumentType.Wordprocessing]: 'callout.documentText',
  [CollaboraDocumentType.Spreadsheet]: 'callout.documentSpreadsheet',
  [CollaboraDocumentType.Presentation]: 'callout.documentPresentation',
};

export const collaboraTypeLabelKeyForType = (type: CollaboraDocumentType | string): CollaboraTypeLabelKey | undefined =>
  DOCUMENT_TYPE_LABEL_KEY[type as CollaboraDocumentType];

/**
 * True when the incoming file's extension maps to the same document type as the
 * current document. Returns `false` for an unknown extension (the extension
 * allowlist check in `validateCollaboraImportFile` runs first and catches those).
 */
export const isSameCollaboraDocumentType = (
  filename: string,
  currentDocumentType: CollaboraDocumentType | string
): boolean => {
  const incoming = collaboraDocumentTypeFromFilename(filename);
  return incoming !== undefined && incoming === currentDocumentType;
};
