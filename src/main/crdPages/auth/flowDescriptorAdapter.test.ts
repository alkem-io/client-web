import { describe, expect, it } from 'vitest';
import {
  aal2LoginFlow,
  enrolledSecondFactorSettingsFlow,
  passkeyLoginFlow,
  secondFactorSettingsFlow,
  WEBAUTHN_LOGIN_OPTIONS,
  WEBAUTHN_REGISTRATION_OPTIONS,
} from './__fixtures__/secondFactorFlows';
import { flowDescriptorAdapter } from './flowDescriptorAdapter';

const names = (nodes: { name: string }[]) => nodes.map(node => node.name);

describe('flowDescriptorAdapter — second factor', () => {
  it('buckets an aal2 login flow into the totp, lookupSecret and webauthn groups, none under default', () => {
    const { groups } = flowDescriptorAdapter(aal2LoginFlow, 'login');

    expect(names(groups.totp.inputs)).toEqual(['totp_code']);
    expect(groups.totp.submits).toEqual([expect.objectContaining({ name: 'method', value: 'totp' })]);
    expect(names(groups.lookupSecret.inputs)).toEqual(['lookup_secret']);
    expect(groups.lookupSecret.submits).toEqual([expect.objectContaining({ name: 'method', value: 'lookup_secret' })]);
    expect(groups.webauthn.triggers).toEqual([
      expect.objectContaining({ name: 'webauthn_login_trigger', trigger: 'oryWebAuthnLogin', value: WEBAUTHN_LOGIN_OPTIONS }),
    ]);

    expect(groups.default).toEqual([]);
    expect(groups.rest).toEqual([]);
    expect(groups.submit).toEqual([]);
    expect(groups.passkey).toEqual([]);
    expect(names(groups.hidden)).toEqual(['csrf_token', 'identifier', 'webauthn_login']);
  });

  it('emits the image and text nodes of a settings flow', () => {
    const { groups } = flowDescriptorAdapter(secondFactorSettingsFlow, 'settings', { keepSecondFactor: true });

    expect(groups.totp.images).toEqual([
      { src: 'data:image/png;base64,iVBORw0KGgo=', alt: 'Authenticator app QR code', width: 256, height: 256 },
    ]);
    expect(groups.totp.texts).toEqual([
      expect.objectContaining({ id: 'totp_secret_key', text: 'JBSWY3DPEHPK3PXP' }),
    ]);
    expect(names(groups.totp.inputs)).toEqual(['totp_code']);
    expect(groups.lookupSecret.texts).toEqual([
      expect.objectContaining({ id: 'lookup_secret_codes', text: 'abcd1234, efgh5678' }),
    ]);
    expect(names(groups.lookupSecret.submits)).toEqual([
      'lookup_secret_regenerate',
      'lookup_secret_reveal',
      'lookup_secret_confirm',
      'lookup_secret_disable',
    ]);
    expect(names(groups.webauthn.inputs)).toEqual(['webauthn_register_displayname']);
    expect(groups.webauthn.triggers).toEqual([
      expect.objectContaining({
        name: 'webauthn_register_trigger',
        trigger: 'oryWebAuthnRegistration',
        value: WEBAUTHN_REGISTRATION_OPTIONS,
      }),
    ]);
    expect(names(groups.hidden)).toContain('webauthn_register');
  });

  it('carries the label context of a security key removal', () => {
    const { groups } = flowDescriptorAdapter(enrolledSecondFactorSettingsFlow, 'settings', { keepSecondFactor: true });

    expect(groups.totp.submits).toEqual([expect.objectContaining({ name: 'totp_unlink', value: 'true' })]);
    expect(groups.webauthn.submits).toEqual([
      expect.objectContaining({ name: 'webauthn_remove', value: 'key-1', labelContext: expect.objectContaining({ display_name: 'Blue key' }) }),
    ]);
  });

  it('strips the second-factor groups from a settings flow unless asked to keep them', () => {
    const { groups } = flowDescriptorAdapter(secondFactorSettingsFlow, 'settings', { keepPasskeys: true });

    expect(groups.totp.inputs).toEqual([]);
    expect(groups.totp.images).toEqual([]);
    expect(groups.lookupSecret.texts).toEqual([]);
    expect(groups.webauthn.triggers).toEqual([]);
    expect(names(groups.passkey)).toEqual(['passkey_create_data']);
  });

  it('keeps a passkey login flow in the passkey group only', () => {
    const { groups } = flowDescriptorAdapter(passkeyLoginFlow, 'login');

    expect(groups.passkey).toEqual([
      expect.objectContaining({ name: 'passkey_login_trigger', trigger: 'oryPasskeyLogin' }),
    ]);
    expect(groups.webauthn.triggers).toEqual([]);
    expect(groups.totp.inputs).toEqual([]);
    expect(groups.lookupSecret.inputs).toEqual([]);
  });
});
