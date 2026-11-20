import { describe, expect, test } from 'vitest';
import { ApplicationState } from '../invitations/InvitationApplicationConstants';
import isApplicationPending from './isApplicationPending';

describe('isApplicationPending', () => {
  test.each([
    [ApplicationState.NEW, true],
    // Transient server-side approval step: still awaiting the outcome.
    [ApplicationState.APPROVING, true],
    [ApplicationState.APPROVED, false],
    [ApplicationState.REJECTED, false],
    // Archived is terminal (withdrawn/closed), not pending.
    [ApplicationState.ARCHIVED, false],
  ])('%s → pending=%s', (state, expected) => {
    expect(isApplicationPending(state)).toBe(expected);
  });

  test('no application at all is not pending', () => {
    expect(isApplicationPending(undefined)).toBe(false);
    expect(isApplicationPending('')).toBe(false);
  });

  test('every ApplicationState member is classified', () => {
    for (const state of Object.values(ApplicationState)) {
      expect(typeof isApplicationPending(state)).toBe('boolean');
    }
  });
});
