import {
  COLLABORA_IMPORT_EXTENSIONS_P1,
  COLLABORA_IMPORT_MAX_BYTES,
  type CollaboraImportExtensionP1,
} from './collaboraImportFormats';

export type ValidationError =
  | { kind: 'no-file' }
  | { kind: 'multiple-files' }
  | { kind: 'folder' }
  | { kind: 'extension'; received: string }
  | { kind: 'size'; bytes: number; maxBytes: number };

export type ValidationResult = { ok: true; file: File } | { ok: false; error: ValidationError };

const ALLOWED_EXTENSIONS_LOWER: ReadonlyArray<string> = COLLABORA_IMPORT_EXTENSIONS_P1.map(ext => ext.toLowerCase());

const extensionOf = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot < 0) return '';
  return filename.slice(lastDot).toLowerCase();
};

const isAllowedExtension = (ext: string): ext is CollaboraImportExtensionP1 =>
  (ALLOWED_EXTENSIONS_LOWER as ReadonlyArray<string>).includes(ext);

const collectFiles = (input: FileList | File[] | DataTransferItemList): File[] => {
  if (Array.isArray(input)) return input.filter((f): f is File => f instanceof File);
  if (typeof FileList !== 'undefined' && input instanceof FileList) {
    return Array.from(input);
  }
  if (typeof DataTransferItemList !== 'undefined' && input instanceof DataTransferItemList) {
    const files: File[] = [];
    for (let i = 0; i < input.length; i += 1) {
      const item = input[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    return files;
  }
  return [];
};

export const validateCollaboraImportFile = (input: FileList | File[] | DataTransferItemList): ValidationResult => {
  const files = collectFiles(input);

  if (files.length === 0) {
    return { ok: false, error: { kind: 'no-file' } };
  }
  if (files.length > 1) {
    return { ok: false, error: { kind: 'multiple-files' } };
  }

  const file = files[0];

  // Folders dropped onto an upload zone surface as zero-byte File entries with empty type and no extension.
  // The most reliable signal is a missing extension on a non-empty name.
  if (file.size === 0 && file.type === '' && !file.name.includes('.')) {
    return { ok: false, error: { kind: 'folder' } };
  }

  const ext = extensionOf(file.name);
  if (!isAllowedExtension(ext)) {
    return { ok: false, error: { kind: 'extension', received: ext || file.name } };
  }

  if (file.size > COLLABORA_IMPORT_MAX_BYTES) {
    return { ok: false, error: { kind: 'size', bytes: file.size, maxBytes: COLLABORA_IMPORT_MAX_BYTES } };
  }

  return { ok: true, file };
};
