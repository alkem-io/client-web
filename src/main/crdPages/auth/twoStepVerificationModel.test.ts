import type { SettingsFlow, UiNode, UiNodeInputAttributes } from '@ory/kratos-client';
import { describe, expect, it } from 'vitest';
import {
  enrolledSecondFactorSettingsFlow,
  secondFactorSettingsFlow,
  WEBAUTHN_REGISTRATION_OPTIONS,
} from './__fixtures__/secondFactorFlows';
import { adaptTwoStepVerification, offersTwoStepVerification } from './twoStepVerificationModel';

const LOOKUP_SUBMITS = [
  'lookup_secret_regenerate',
  'lookup_secret_reveal',
  'lookup_secret_confirm',
  'lookup_secret_disable',
];

/** The flow with only the named recovery-code submits (and the codes text only when `withCodes`). */
const withLookup = (flow: SettingsFlow, keep: string[], withCodes = false): SettingsFlow =>
  ({
    ...flow,
    ui: {
      ...flow.ui,
      nodes: flow.ui.nodes.filter((node: UiNode) => {
        if (node.attributes.node_type === 'text') {
          return node.group !== 'lookup_secret' || withCodes;
        }
        const name = (node.attributes as UiNodeInputAttributes).name;
        return !LOOKUP_SUBMITS.includes(name) || keep.includes(name);
      }),
    },
  }) as SettingsFlow;

describe('offersTwoStepVerification', () => {
  it('is true for a flow carrying a second-factor method', () => {
    expect(offersTwoStepVerification(secondFactorSettingsFlow)).toBe(true);
  });

  it('is false for a flow with none of the second-factor methods', () => {
    const flow = {
      ...secondFactorSettingsFlow,
      ui: {
        ...secondFactorSettingsFlow.ui,
        nodes: secondFactorSettingsFlow.ui.nodes.filter(
          (node: UiNode) => !['totp', 'lookup_secret', 'webauthn'].includes(node.group)
        ),
      },
    } as SettingsFlow;

    expect(flow.ui.nodes.length).toBeGreaterThan(0);
    expect(offersTwoStepVerification(flow)).toBe(false);
  });
});

describe('adaptTwoStepVerification', () => {
  it('offers the authenticator set-up with its QR and secret when none is enrolled', () => {
    const model = adaptTwoStepVerification(withLookup(secondFactorSettingsFlow, ['lookup_secret_regenerate']));

    expect(model.authenticator).toEqual({
      kind: 'available',
      qr: expect.objectContaining({ src: 'data:image/png;base64,iVBORw0KGgo=' }),
      secret: 'JBSWY3DPEHPK3PXP',
      codeError: undefined,
    });
    expect(model.enrolled).toBe(false);
    expect(model.recoveryCodes).toEqual({ kind: 'disabled' });
  });

  it('submits method totp with the code to confirm, and totp_unlink to remove', () => {
    const model = adaptTwoStepVerification(secondFactorSettingsFlow);

    expect(model.action).toBe(secondFactorSettingsFlow.ui.action);
    expect(model.fields.confirmAuthenticator('123456')).toEqual({
      csrf_token: 'csrf-value',
      method: 'totp',
      totp_code: '123456',
    });
    expect(model.fields.removeAuthenticator()).toEqual({
      csrf_token: 'csrf-value',
      method: 'totp',
      totp_unlink: 'true',
    });
  });

  it('builds the security-key registration form from the flow', () => {
    const model = adaptTwoStepVerification(secondFactorSettingsFlow);

    expect(model.securityKeys).toEqual({
      keys: [],
      registration: {
        action: secondFactorSettingsFlow.ui.action,
        hiddenFields: [
          { name: 'csrf_token', value: 'csrf-value' },
          { name: 'method', value: 'webauthn' },
          { name: 'webauthn_register', value: '' },
        ],
        resultFieldName: 'webauthn_register',
        nameFieldName: 'webauthn_register_displayname',
        trigger: { name: 'webauthn_register_trigger', value: WEBAUTHN_REGISTRATION_OPTIONS },
      },
    });
  });

  it("carries the identity provider's refusal of the key's name", () => {
    const flow = {
      ...secondFactorSettingsFlow,
      ui: {
        ...secondFactorSettingsFlow.ui,
        nodes: secondFactorSettingsFlow.ui.nodes.map((node: UiNode) =>
          (node.attributes as UiNodeInputAttributes).name === 'webauthn_register_displayname'
            ? { ...node, messages: [{ id: 4000002, type: 'error', text: 'Property is missing.' }] }
            : node
        ),
      },
    } as SettingsFlow;

    expect(adaptTwoStepVerification(flow).securityKeys?.registration?.nameError).toBe('Property is missing.');
    expect(adaptTwoStepVerification(secondFactorSettingsFlow).securityKeys?.registration?.nameError).toBeUndefined();
  });

  it('reads an enrolled authenticator and the named security keys', () => {
    const model = adaptTwoStepVerification(withLookup(enrolledSecondFactorSettingsFlow, ['lookup_secret_regenerate']));

    expect(model.authenticator).toEqual({ kind: 'enrolled' });
    expect(model.securityKeys?.keys).toEqual([{ id: 'key-1', name: 'Blue key' }]);
    expect(model.enrolled).toBe(true);
    expect(model.soleFactor).toBe(false);
    expect(model.recoveryCodes).toEqual({ kind: 'none' });
    expect(model.fields.removeSecurityKey('key-1')).toEqual({
      csrf_token: 'csrf-value',
      method: 'webauthn',
      webauthn_remove: 'key-1',
    });
  });

  it('reads generated-but-unconfirmed recovery codes', () => {
    const model = adaptTwoStepVerification(
      withLookup(enrolledSecondFactorSettingsFlow, ['lookup_secret_regenerate', 'lookup_secret_confirm'], true)
    );

    expect(model.recoveryCodes).toEqual({ kind: 'unconfirmed', codes: ['abcd1234', 'efgh5678'] });
  });

  it('reads confirmed recovery codes, and counts them as enrolled', () => {
    const model = adaptTwoStepVerification(
      withLookup(secondFactorSettingsFlow, [
        'lookup_secret_reveal',
        'lookup_secret_regenerate',
        'lookup_secret_disable',
      ])
    );

    expect(model.recoveryCodes).toEqual({ kind: 'confirmed' });
    expect(model.enrolled).toBe(true);
    expect(model.soleFactor).toBe(true);
    expect(model.fields.removeRecoveryCodes()).toEqual({
      csrf_token: 'csrf-value',
      method: 'lookup_secret',
      lookup_secret_disable: 'true',
    });
  });

  it('keeps flow messages only when a second-factor method produced them', () => {
    const message = { id: 1050001, type: 'success', text: 'Your changes have been saved!' };
    const flow = (active: string) =>
      ({
        ...secondFactorSettingsFlow,
        active,
        ui: { ...secondFactorSettingsFlow.ui, messages: [message] },
      }) as SettingsFlow;

    expect(adaptTwoStepVerification(flow('totp')).messages).toEqual([
      expect.objectContaining({ id: 1050001, type: 'success', text: message.text }),
    ]);
    expect(adaptTwoStepVerification(flow('password')).messages).toEqual([]);
  });
});
