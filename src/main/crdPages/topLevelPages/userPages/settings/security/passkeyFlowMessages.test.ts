import { describe, expect, it } from 'vitest';
import { passkeyOwnsFlowMessages } from './passkeyFlowMessages';

describe('passkeyOwnsFlowMessages — flow-level message attribution (T028)', () => {
  it.each([
    ['webauthn', true],
    ['passkey', true],
    ['password', false],
    ['profile', false],
    ['oidc', false],
    ['totp', false],
  ] as const)('%s ⇒ %s', (active, expected) => {
    expect(passkeyOwnsFlowMessages(active)).toBe(expected);
  });

  it('fails closed when Kratos attributes the outcome to nothing at all', () => {
    // The regression: `active === undefined` used to keep the messages, so a password or
    // profile outcome with no attribution surfaced inside the passkey card.
    expect(passkeyOwnsFlowMessages(undefined)).toBe(false);
  });
});
