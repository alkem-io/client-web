export type MediaFileConstraints = {
  allowedMimeTypes?: string[];
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
};

export type ValidateMediaFileResult = { ok: true } | { ok: false; reason: 'type' | 'tooSmall' | 'tooLarge' };

const HEIC_TYPES = new Set(['image/heic', 'image/heif']);

const isHeic = (file: File): boolean => HEIC_TYPES.has(file.type);

const decodeImage = (file: File): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image'));
    };
    img.src = url;
  });

/**
 * Pure async validation for a single image file against server-declared constraints.
 * Mirrors the MUI `CalloutFramingMediaGalleryField` validation loop: HEIC passes
 * through (server converts), unsupported MIME types fail with 'type', and
 * dimension violations fail with 'tooSmall' or 'tooLarge'.
 */
export async function validateMediaFile(
  file: File,
  constraints: MediaFileConstraints = {}
): Promise<ValidateMediaFileResult> {
  if (isHeic(file)) return { ok: true };

  if (constraints.allowedMimeTypes && constraints.allowedMimeTypes.length > 0) {
    if (!constraints.allowedMimeTypes.includes(file.type)) {
      return { ok: false, reason: 'type' };
    }
  }

  const { minWidth, minHeight, maxWidth, maxHeight } = constraints;
  if (!minWidth && !minHeight && !maxWidth && !maxHeight) return { ok: true };

  try {
    const { width, height } = await decodeImage(file);
    if ((minWidth && width < minWidth) || (minHeight && height < minHeight)) {
      return { ok: false, reason: 'tooSmall' };
    }
    if ((maxWidth && width > maxWidth) || (maxHeight && height > maxHeight)) {
      return { ok: false, reason: 'tooLarge' };
    }
    return { ok: true };
  } catch {
    // If decoding fails for a type we thought was supported, reject as 'type'.
    return { ok: false, reason: 'type' };
  }
}
