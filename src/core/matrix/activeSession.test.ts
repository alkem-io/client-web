import { describe, expect, it, vi } from 'vitest';
import { registerActiveSession, stopActiveSession, unregisterActiveSession } from './activeSession';

describe('activeSession', () => {
  it('unregistering the older session leaves the newer one active', () => {
    const signOutA = vi.fn();
    const signOutB = vi.fn();
    registerActiveSession(signOutA);
    registerActiveSession(signOutB);

    unregisterActiveSession(signOutA);

    expect(stopActiveSession()).toBe(true);
    expect(signOutB).toHaveBeenCalledOnce();
    expect(signOutA).not.toHaveBeenCalled();
  });
});
