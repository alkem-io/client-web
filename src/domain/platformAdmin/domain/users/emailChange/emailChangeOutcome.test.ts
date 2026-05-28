import { describe, expect, it } from 'vitest';
import { UserEmailChangeAuditOutcome } from '@/core/apollo/generated/graphql-schema';
import { type EmailChangeOutcomeClass, getEmailChangeOutcomeView } from './emailChangeOutcome';

const EXPECTED_CLASS: Record<UserEmailChangeAuditOutcome, EmailChangeOutcomeClass> = {
  [UserEmailChangeAuditOutcome.Committed]: 'success',
  [UserEmailChangeAuditOutcome.DriftResolved]: 'success',
  [UserEmailChangeAuditOutcome.SecuritySignalFailed]: 'success-with-warning',
  [UserEmailChangeAuditOutcome.NewAddressNotificationFailed]: 'success-with-warning',
  [UserEmailChangeAuditOutcome.GlobalAdminNotificationFailed]: 'success-with-warning',
  [UserEmailChangeAuditOutcome.SpaceAdminNotificationFailed]: 'success-with-warning',
  [UserEmailChangeAuditOutcome.SessionInvalidationFailed]: 'success-with-warning',
  [UserEmailChangeAuditOutcome.RejectedValidation]: 'failure',
  [UserEmailChangeAuditOutcome.RejectedConflict]: 'failure',
  [UserEmailChangeAuditOutcome.RolledBack]: 'failure',
  [UserEmailChangeAuditOutcome.DriftDetected]: 'failure',
  [UserEmailChangeAuditOutcome.DriftResolutionFailed]: 'failure',
};

describe('getEmailChangeOutcomeView', () => {
  it('classifies every UserEmailChangeAuditOutcome value with the expected visual class', () => {
    for (const [outcome, expectedClass] of Object.entries(EXPECTED_CLASS)) {
      expect(getEmailChangeOutcomeView(outcome).class).toBe(expectedClass);
    }
  });

  it('gives every outcome a defined, distinct label key', () => {
    const labelKeys = Object.keys(EXPECTED_CLASS).map(outcome => getEmailChangeOutcomeView(outcome).labelKey);
    expect(labelKeys.every(Boolean)).toBe(true);
    expect(new Set(labelKeys).size).toBe(labelKeys.length);
  });

  it('preserves the raw outcome value on the view model', () => {
    expect(getEmailChangeOutcomeView(UserEmailChangeAuditOutcome.Committed).raw).toBe(
      UserEmailChangeAuditOutcome.Committed
    );
  });

  it('falls back to a safe neutral label and class for an unknown future outcome', () => {
    const view = getEmailChangeOutcomeView('SOME_FUTURE_OUTCOME');
    expect(view.raw).toBe('SOME_FUTURE_OUTCOME');
    expect(view.labelKey).toBe('pages.admin.users.emailChange.outcomes.unknown');
    expect(view.class).toBe('failure');
  });
});
