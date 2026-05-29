import type { KratosPasskeyTrigger } from '@/crd/components/auth/flowDescriptor';

/**
 * Invokes the browser/Kratos passkey (WebAuthn) routine for a resolved trigger.
 *
 * A passkey button is not a plain form submit — it starts a browser WebAuthn
 * ceremony via globals the Ory passkey script injects (`window.__oryPasskey*`).
 * The CRD layer never touches these globals; it delegates here, in the
 * integration layer. Mirrors the MUI `KratosPasskeyButton` logic.
 */

declare global {
  interface Window {
    __oryPasskeyLogin?: (options?: unknown) => Promise<void>;
    __oryPasskeyLoginAutocompleteInit?: (options?: unknown) => Promise<void>;
    __oryPasskeyRegistration?: (options?: unknown) => Promise<void>;
    __oryPasskeySettingsRegistration?: (options?: unknown) => Promise<void>;
  }
}

export type PasskeyTriggerErrorReason = 'script-not-loaded' | 'not-supported' | 'failed';

export class PasskeyTriggerError extends Error {
  readonly reason: PasskeyTriggerErrorReason;

  constructor(reason: PasskeyTriggerErrorReason, message: string) {
    super(message);
    this.name = 'PasskeyTriggerError';
    this.reason = reason;
  }
}

const TRIGGER_GLOBAL: Record<KratosPasskeyTrigger, keyof Window> = {
  oryPasskeyLogin: '__oryPasskeyLogin',
  oryPasskeyLoginAutocompleteInit: '__oryPasskeyLoginAutocompleteInit',
  oryPasskeyRegistration: '__oryPasskeyRegistration',
  oryPasskeySettingsRegistration: '__oryPasskeySettingsRegistration',
};

/**
 * Runs the passkey ceremony for the given trigger.
 *
 * @throws {PasskeyTriggerError} when the browser lacks WebAuthn support
 * (`not-supported`), the Ory script has not loaded yet (`script-not-loaded`),
 * or the ceremony itself fails / is cancelled (`failed`).
 */
export async function invokePasskeyTrigger(trigger: KratosPasskeyTrigger): Promise<void> {
  if (typeof window.PublicKeyCredential === 'undefined') {
    throw new PasskeyTriggerError('not-supported', 'Passkeys are not supported in this browser.');
  }

  const routine = window[TRIGGER_GLOBAL[trigger]] as ((options?: unknown) => Promise<void>) | undefined;
  if (typeof routine !== 'function') {
    throw new PasskeyTriggerError('script-not-loaded', 'The passkey script is still loading. Please try again.');
  }

  try {
    await routine();
  } catch (error) {
    throw new PasskeyTriggerError('failed', error instanceof Error ? error.message : 'Passkey authentication failed.');
  }
}
