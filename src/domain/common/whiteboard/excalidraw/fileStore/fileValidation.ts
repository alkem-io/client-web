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
