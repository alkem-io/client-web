import type TranslationKey from '@/core/i18n/utils/TranslationKey';

export const EMAIL_CHANGE_GENERIC_ERROR_KEY = 'pages.admin.users.emailChange.errors.generic' satisfies TranslationKey;

const EMAIL_CHANGE_ERROR_KEYS = {
  EMAIL_CHANGE_VALIDATION: 'pages.admin.users.emailChange.errors.validation',
  EMAIL_CHANGE_NO_CHANGE: 'pages.admin.users.emailChange.errors.noChange',
  EMAIL_CHANGE_CONFLICT: 'pages.admin.users.emailChange.errors.conflict',
  EMAIL_CHANGE_SUBJECT_NOT_FOUND: 'pages.admin.users.emailChange.errors.subjectNotFound',
  EMAIL_CHANGE_KRATOS_UNREACHABLE: 'pages.admin.users.emailChange.errors.kratosUnreachable',
  EMAIL_CHANGE_KRATOS_WRITE_FAILED: 'pages.admin.users.emailChange.errors.kratosWriteFailed',
  EMAIL_CHANGE_ALKEMIO_WRITE_FAILED: 'pages.admin.users.emailChange.errors.alkemioWriteFailed',
  EMAIL_CHANGE_DRIFT_DETECTED: 'pages.admin.users.emailChange.errors.driftDetected',
  EMAIL_CHANGE_DRIFT_RESOLUTION_FAILED: 'pages.admin.users.emailChange.errors.driftResolutionFailed',
  EMAIL_CHANGE_DRIFT_NOT_FOUND: 'pages.admin.users.emailChange.errors.driftNotFound',
  EMAIL_CHANGE_UNAUTHORIZED: 'pages.admin.users.emailChange.errors.unauthorized',
} satisfies Record<string, TranslationKey>;

/**
 * Maps a server `extensions.code` from an email-change failure to a human-readable
 * `translation` key. Any unmapped or unexpected code resolves to the generic
 * catch-all so the admin never sees a blank or raw technical error.
 */
export const mapEmailChangeErrorCode = (code: string | undefined): TranslationKey => {
  if (code && code in EMAIL_CHANGE_ERROR_KEYS) {
    return EMAIL_CHANGE_ERROR_KEYS[code as keyof typeof EMAIL_CHANGE_ERROR_KEYS];
  }
  return EMAIL_CHANGE_GENERIC_ERROR_KEY;
};
