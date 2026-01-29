/**
 * Contract: Enhanced Notification Types
 * Feature: 013-error-handling-extensions
 *
 * This file documents the type changes for the notification system.
 * These are NOT runtime contracts but documentation of the type changes.
 */

// ============================================================================
// BEFORE (Current Implementation)
// ============================================================================

export type SeverityBefore = 'info' | 'warning' | 'error' | 'success';

export type NotificationBefore = {
  id: string;
  severity: SeverityBefore;
  message: string;
};

export type PushNotificationPayloadBefore = {
  message: string;
  severity?: SeverityBefore;
};

// ============================================================================
// AFTER (Enhanced Implementation)
// ============================================================================

export type Severity = 'info' | 'warning' | 'error' | 'success';

export type Notification = {
  id: string;
  severity: Severity;
  message: string;
  numericCode?: number; // NEW: Optional error code for support mailto
};

export type PushNotificationPayload = {
  message: string;
  severity?: Severity;
  numericCode?: number; // NEW: Optional error code
};

// ============================================================================
// GraphQL Error Extensions (from server)
// ============================================================================

export interface GraphQLErrorExtensions {
  code?: string; // Existing: e.g., 'ENTITY_NOT_FOUND'
  numericCode?: number; // NEW: e.g., 10101
  userMessage?: string; // NEW: i18n key e.g., 'apollo.errors.userMessages.notFound.entity'
}

// ============================================================================
// useNotification Hook Signature
// ============================================================================

// Before:
// (message: string, severity?: Severity) => void

// After:
// (message: string, severity?: Severity, numericCode?: number) => void

// ============================================================================
// Support Mailto URL Generator
// ============================================================================

export type SupportMailtoOptions = {
  numericCode?: number;
  t: (key: string, options?: Record<string, unknown>) => string;
};

/**
 * Generates a mailto URL for contacting support with pre-filled subject and body.
 * The helper composes translated subject/body using the provided translation function (t)
 * and numericCode. When numericCode is provided (including 0), includes it in the
 * subject and body for reference. When numericCode is undefined, uses generic templates.
 *
 * @param options.numericCode - Optional error code to include in the email
 * @param options.t - Translation function from react-i18next
 * @returns Encoded mailto URL
 */
export function generateSupportMailtoUrl(options: SupportMailtoOptions): string {
  const { numericCode, t } = options;
  const email = t('common.supportEmail');

  const subject =
    numericCode !== undefined
      ? t('apollo.errors.support.emailSubject', { code: numericCode })
      : t('apollo.errors.support.emailSubjectGeneric');

  const body =
    numericCode !== undefined
      ? t('apollo.errors.support.emailBody', { code: numericCode })
      : t('apollo.errors.support.emailBodyGeneric');

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
