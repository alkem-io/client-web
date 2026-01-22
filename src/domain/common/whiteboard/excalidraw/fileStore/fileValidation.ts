export const DEFAULT_ALLOWED_IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

export type ImageValidationFailureReason = 'unsupportedMimeType' | 'fileTooLarge';

export interface ImageValidationConfig {
  allowedMimeTypes?: readonly string[];
  maxFileSizeBytes?: number;
}

export type ImageValidationResult =
  | { ok: true }
  | {
      ok: false;
      reason: ImageValidationFailureReason;
      allowedMimeTypes?: readonly string[];
      maxFileSizeBytes?: number;
    };

export const isAllowedMimeType = (mimeType: string, allowedMimeTypes?: readonly string[]): boolean => {
  const allowed = allowedMimeTypes ?? DEFAULT_ALLOWED_IMAGE_MIME_TYPES;
  return allowed.includes(mimeType);
};

export const isWithinMaxFileSize = (sizeBytes: number, maxFileSizeBytes?: number): boolean => {
  if (!maxFileSizeBytes) {
    return true;
  }
  return sizeBytes <= maxFileSizeBytes;
};

export const validateWhiteboardImageFile = (file: File, config: ImageValidationConfig = {}): ImageValidationResult => {
  const { allowedMimeTypes, maxFileSizeBytes } = config;

  if (!isAllowedMimeType(file.type, allowedMimeTypes)) {
    return {
      ok: false,
      reason: 'unsupportedMimeType',
      allowedMimeTypes: allowedMimeTypes ?? DEFAULT_ALLOWED_IMAGE_MIME_TYPES,
    };
  }

  if (!isWithinMaxFileSize(file.size, maxFileSizeBytes)) {
    return {
      ok: false,
      reason: 'fileTooLarge',
      maxFileSizeBytes,
    };
  }

  return { ok: true };
};

const bytesToMB = (bytes: number): number => bytes / (1024 * 1024);

/**
 * Keep only mime types that look like images.
 */
export const filterImageMimeTypes = (allowedMimeTypes?: readonly string[]): readonly string[] | undefined => {
  if (!allowedMimeTypes) {
    return undefined;
  }
  return allowedMimeTypes.filter(mime => mime.startsWith('image/'));
};

/**
 * Convert bytes to a user-facing megabyte string.
 * Uses MiB (1024^2) since the backend limit is in bytes.
 */
export const formatMaxFileSizeMb = (maxFileSizeBytes?: number): string | undefined => {
  if (!maxFileSizeBytes) {
    return undefined;
  }

  const mb = bytesToMB(maxFileSizeBytes);
  const rounded = mb < 10 ? Math.round(mb * 10) / 10 : Math.round(mb);
  return `${rounded} MB`;
};

export interface WhiteboardImageUploadI18nParams {
  /** Comma-separated list of formats/mime types to show in copy. */
  formats: string;
  /** Formatted max size, e.g. "15 MB" */
  maxSize: string;
}

/**
 * Derive message params for the whiteboard image upload callouts.
 * Designed to be used together with i18n keys under `callout.whiteboard.images.*`.
 */
export const getWhiteboardImageUploadI18nParams = (
  validation: Extract<ImageValidationResult, { ok: false }>
): Partial<WhiteboardImageUploadI18nParams> => {
  const allowedImageMimeTypes = filterImageMimeTypes(validation.allowedMimeTypes) ?? DEFAULT_ALLOWED_IMAGE_MIME_TYPES;
  const formats = allowedImageMimeTypes.join(', ');

  const maxSize = formatMaxFileSizeMb(validation.maxFileSizeBytes);

  return {
    formats,
    ...(maxSize ? { maxSize } : {}),
  };
};
