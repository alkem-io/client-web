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
  email: string;
  subject: string;
  body: string;
};

/**
 * Generates a properly encoded mailto URL for support contact.
 *
 * @param options - Email, subject, and body strings (already translated)
 * @returns Encoded mailto URL
 */
export function generateSupportMailtoUrl(options: SupportMailtoOptions): string {
  const { email, subject, body } = options;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
