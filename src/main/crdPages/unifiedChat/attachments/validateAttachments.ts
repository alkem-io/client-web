/** Client-side limits for conversation message attachments (feature 013).
 *  These mirror the server-side conversation-bucket policy (FR-020/022/023);
 *  the server remains authoritative — these only give fast, local feedback. */
export const MAX_ATTACHMENTS_PER_MESSAGE = 10;
export const MAX_ATTACHMENT_SIZE_BYTES = 50 * 1024 * 1024; // 50 MiB

/**
 * Curated safe default of allowed MIME types — used only when the conversation
 * bucket has not provided its own `allowedMimeTypes`. Executables / scripts /
 * unknown types are rejected (FR-022). When the bucket policy is available, that
 * list takes precedence.
 */
export const DEFAULT_ALLOWED_ATTACHMENT_MIME_TYPES: readonly string[] = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
];

export type AttachmentRejectionReason = 'tooMany' | 'tooLarge' | 'unsupportedType';

export type AttachmentRejection = {
  fileName: string;
  reason: AttachmentRejectionReason;
};

export type AttachmentValidationResult = {
  /** Files that passed every check and may be uploaded. */
  accepted: File[];
  /** Per-file rejections, in input order, for surfacing clear errors. */
  rejected: AttachmentRejection[];
};

type ValidateOptions = {
  /** How many attachments are already staged on the draft message. */
  existingCount: number;
  /** Allowed MIME types from the bucket policy; falls back to the safe default. */
  allowedMimeTypes?: readonly string[];
  maxFileSizeBytes?: number;
  maxAttachments?: number;
};

/**
 * Validates a batch of newly-picked files against the per-message attachment
 * limits. Pure — no upload, no I/O. Files exceeding the count cap, the size cap,
 * or the allowed-type set are rejected with a machine-readable reason that the
 * caller maps to a localized message.
 */
export function validateAttachments(files: File[], options: ValidateOptions): AttachmentValidationResult {
  const {
    existingCount,
    allowedMimeTypes = DEFAULT_ALLOWED_ATTACHMENT_MIME_TYPES,
    maxFileSizeBytes = MAX_ATTACHMENT_SIZE_BYTES,
    maxAttachments = MAX_ATTACHMENTS_PER_MESSAGE,
  } = options;

  const accepted: File[] = [];
  const rejected: AttachmentRejection[] = [];
  const allowed = new Set(allowedMimeTypes);

  for (const file of files) {
    if (file.type && !allowed.has(file.type)) {
      rejected.push({ fileName: file.name, reason: 'unsupportedType' });
      continue;
    }
    if (file.size > maxFileSizeBytes) {
      rejected.push({ fileName: file.name, reason: 'tooLarge' });
      continue;
    }
    if (existingCount + accepted.length >= maxAttachments) {
      rejected.push({ fileName: file.name, reason: 'tooMany' });
      continue;
    }
    accepted.push(file);
  }

  return { accepted, rejected };
}
