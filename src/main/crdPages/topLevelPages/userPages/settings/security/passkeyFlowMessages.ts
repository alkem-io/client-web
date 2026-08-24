import type { SettingsFlow } from '@ory/kratos-client';

/**
 * Whether the passkey card may render the settings flow's *flow-level* messages.
 *
 * One Kratos settings flow backs three cards (password, passkey, Connected Accounts), and its
 * `ui.messages` describe whichever method was last submitted — `flow.active` is the only
 * attribution Kratos gives. Rendering an unattributed message in every card is what put a
 * password outcome inside the passkey card (walk finding T028), so the rule is a closed one:
 * the message stays only when Kratos explicitly names a passkey-owned method. `undefined`
 * (no attribution at all), `'password'`, `'profile'` and anything else all drop.
 */
export const passkeyOwnsFlowMessages = (active: SettingsFlow['active']): boolean =>
  active === 'webauthn' || active === 'passkey';
