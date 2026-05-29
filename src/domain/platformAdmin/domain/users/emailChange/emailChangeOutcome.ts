import type TranslationKey from '@/core/i18n/utils/TranslationKey';

export type EmailChangeOutcomeClass = 'success' | 'success-with-warning' | 'failure';

export type EmailChangeOutcomeView = {
  raw: string;
  labelKey: TranslationKey;
  class: EmailChangeOutcomeClass;
};

type OutcomeDefinition = {
  class: EmailChangeOutcomeClass;
  labelKey: TranslationKey;
};

const OUTCOME_DEFINITIONS = {
  COMMITTED: { class: 'success', labelKey: 'pages.admin.users.emailChange.outcomes.committed' },
  DRIFT_RESOLVED: { class: 'success', labelKey: 'pages.admin.users.emailChange.outcomes.driftResolved' },
  SECURITY_SIGNAL_FAILED: {
    class: 'success-with-warning',
    labelKey: 'pages.admin.users.emailChange.outcomes.securitySignalFailed',
  },
  NEW_ADDRESS_NOTIFICATION_FAILED: {
    class: 'success-with-warning',
    labelKey: 'pages.admin.users.emailChange.outcomes.newAddressNotificationFailed',
  },
  GLOBAL_ADMIN_NOTIFICATION_FAILED: {
    class: 'success-with-warning',
    labelKey: 'pages.admin.users.emailChange.outcomes.globalAdminNotificationFailed',
  },
  SPACE_ADMIN_NOTIFICATION_FAILED: {
    class: 'success-with-warning',
    labelKey: 'pages.admin.users.emailChange.outcomes.spaceAdminNotificationFailed',
  },
  SESSION_INVALIDATION_FAILED: {
    class: 'success-with-warning',
    labelKey: 'pages.admin.users.emailChange.outcomes.sessionInvalidationFailed',
  },
  REJECTED_VALIDATION: { class: 'failure', labelKey: 'pages.admin.users.emailChange.outcomes.rejectedValidation' },
  REJECTED_CONFLICT: { class: 'failure', labelKey: 'pages.admin.users.emailChange.outcomes.rejectedConflict' },
  ROLLED_BACK: { class: 'failure', labelKey: 'pages.admin.users.emailChange.outcomes.rolledBack' },
  DRIFT_DETECTED: { class: 'failure', labelKey: 'pages.admin.users.emailChange.outcomes.driftDetected' },
  DRIFT_RESOLUTION_FAILED: {
    class: 'failure',
    labelKey: 'pages.admin.users.emailChange.outcomes.driftResolutionFailed',
  },
} satisfies Record<string, OutcomeDefinition>;

// An unrecognized future outcome is shown with a readable neutral label rather than a raw machine code.
const UNKNOWN_OUTCOME: OutcomeDefinition = {
  class: 'failure',
  labelKey: 'pages.admin.users.emailChange.outcomes.unknown',
};

export const getEmailChangeOutcomeView = (raw: string): EmailChangeOutcomeView => {
  const definition =
    raw in OUTCOME_DEFINITIONS ? OUTCOME_DEFINITIONS[raw as keyof typeof OUTCOME_DEFINITIONS] : UNKNOWN_OUTCOME;
  return { raw, labelKey: definition.labelKey, class: definition.class };
};
