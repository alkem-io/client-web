import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WEBAUTHN_LOGIN_OPTIONS, WEBAUTHN_REGISTRATION_OPTIONS } from './__fixtures__/secondFactorFlows';
import { invokePasskeyTrigger, PasskeyTriggerError } from './passkeyTrigger';

describe('invokePasskeyTrigger', () => {
  beforeEach(() => {
    vi.stubGlobal('PublicKeyCredential', class {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete window.__oryWebAuthnRegistration;
    delete window.__oryWebAuthnLogin;
    delete window.__oryPasskeyLogin;
  });

  it('calls the WebAuthn registration routine with the parsed options of the trigger node', async () => {
    const routine = vi.fn().mockResolvedValue(undefined);
    window.__oryWebAuthnRegistration = routine;

    await invokePasskeyTrigger('oryWebAuthnRegistration', WEBAUTHN_REGISTRATION_OPTIONS);

    expect(routine).toHaveBeenCalledWith(JSON.parse(WEBAUTHN_REGISTRATION_OPTIONS));
  });

  it('calls the WebAuthn login routine with the parsed options of the trigger node', async () => {
    const routine = vi.fn().mockResolvedValue(undefined);
    window.__oryWebAuthnLogin = routine;

    await invokePasskeyTrigger('oryWebAuthnLogin', WEBAUTHN_LOGIN_OPTIONS);

    expect(routine).toHaveBeenCalledWith(JSON.parse(WEBAUTHN_LOGIN_OPTIONS));
  });

  it('still calls a passkey routine with no argument', async () => {
    const routine = vi.fn().mockResolvedValue(undefined);
    window.__oryPasskeyLogin = routine;

    await invokePasskeyTrigger('oryPasskeyLogin', 'ignored');

    expect(routine).toHaveBeenCalledWith();
  });

  it('answers script-not-loaded when the WebAuthn global is missing', async () => {
    await expect(invokePasskeyTrigger('oryWebAuthnRegistration', WEBAUTHN_REGISTRATION_OPTIONS)).rejects.toEqual(
      expect.objectContaining({ reason: 'script-not-loaded' })
    );
    await expect(invokePasskeyTrigger('oryWebAuthnLogin')).rejects.toBeInstanceOf(PasskeyTriggerError);
  });
});
