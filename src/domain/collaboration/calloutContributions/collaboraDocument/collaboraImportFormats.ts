export const COLLABORA_IMPORT_EXTENSIONS_P1 = ['.docx', '.xlsx', '.pptx'] as const;

export type CollaboraImportExtensionP1 = (typeof COLLABORA_IMPORT_EXTENSIONS_P1)[number];

export const COLLABORA_IMPORT_MAX_BYTES = 15 * 1024 * 1024;

export const COLLABORA_IMPORT_ACCEPT_ATTR = COLLABORA_IMPORT_EXTENSIONS_P1.join(',');
