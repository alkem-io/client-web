import { describe, expect, it } from 'vitest';
import { UserEmailChangeAuditOutcome } from '@/core/apollo/generated/graphql-schema';
import { deriveDriftState } from './useLatestUserEmailChangeOutcome';

describe('deriveDriftState', () => {
  it('marks a DRIFT_DETECTED latest entry as drifted and exposes both candidate addresses', () => {
    const state = deriveDriftState({
      outcome: UserEmailChangeAuditOutcome.DriftDetected,
      oldEmail: 'old@example.com',
      newEmail: 'new@example.com',
    });
    expect(state.isDrifted).toBe(true);
    expect(state.oldEmail).toBe('old@example.com');
    expect(state.newEmail).toBe('new@example.com');
  });

  it('marks a DRIFT_RESOLUTION_FAILED latest entry as drifted', () => {
    expect(deriveDriftState({ outcome: UserEmailChangeAuditOutcome.DriftResolutionFailed }).isDrifted).toBe(true);
  });

  it('treats every non-drift latest outcome as not drifted', () => {
    const nonDriftOutcomes = [
      UserEmailChangeAuditOutcome.Committed,
      UserEmailChangeAuditOutcome.DriftResolved,
      UserEmailChangeAuditOutcome.SecuritySignalFailed,
      UserEmailChangeAuditOutcome.NewAddressNotificationFailed,
      UserEmailChangeAuditOutcome.GlobalAdminNotificationFailed,
      UserEmailChangeAuditOutcome.SpaceAdminNotificationFailed,
      UserEmailChangeAuditOutcome.SessionInvalidationFailed,
      UserEmailChangeAuditOutcome.RejectedValidation,
      UserEmailChangeAuditOutcome.RejectedConflict,
      UserEmailChangeAuditOutcome.RolledBack,
    ];
    for (const outcome of nonDriftOutcomes) {
      expect(deriveDriftState({ outcome }).isDrifted).toBe(false);
    }
  });

  it('treats a missing latest entry as not drifted', () => {
    expect(deriveDriftState(undefined).isDrifted).toBe(false);
    expect(deriveDriftState(null).isDrifted).toBe(false);
  });
});
