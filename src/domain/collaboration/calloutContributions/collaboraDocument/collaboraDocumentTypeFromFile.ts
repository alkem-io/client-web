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
