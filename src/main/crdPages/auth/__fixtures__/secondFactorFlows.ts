import type { LoginFlow, SettingsFlow, UiNode } from '@ory/kratos-client';

/*
 * Kratos v26.2.0 flows carrying second-factor nodes, built by hand from the
 * node names the identity provider emits for the `totp`, `lookup_secret` and
 * `webauthn` methods. Re-record them from a stack with these methods enabled
 * when the shapes are in doubt.
 */

const input = (
  group: string,
  name: string,
  type: string,
  value: unknown,
  extra: Record<string, unknown> = {},
  label?: { id: number; text: string; context?: Record<string, unknown> }
): UiNode =>
  ({
    type: 'input',
    group,
    attributes: { node_type: 'input', name, type, value, disabled: false, ...extra },
    messages: [],
    meta: label ? { label: { type: 'info', ...label } } : {},
  }) as unknown as UiNode;

const text = (group: string, id: string, textValue: string, context?: Record<string, unknown>): UiNode =>
  ({
    type: 'text',
    group,
    attributes: { node_type: 'text', id, text: { id: 1050006, type: 'info', text: textValue, context } },
    messages: [],
    meta: {},
  }) as unknown as UiNode;

const script = (group: string, id: string): UiNode =>
  ({
    type: 'script',
    group,
    attributes: {
      node_type: 'script',
      id,
      src: 'https://identity.example.test/.well-known/ory/webauthn.js',
      async: true,
      referrerpolicy: 'no-referrer',
      crossorigin: 'anonymous',
      integrity: 'sha512-test',
      type: 'text/javascript',
      nonce: 'nonce',
    },
    messages: [],
    meta: {},
  }) as unknown as UiNode;

export const WEBAUTHN_REGISTRATION_OPTIONS = JSON.stringify({
  publicKey: {
    challenge: 'Y2hhbGxlbmdl',
    rp: { name: 'Alkemio', id: 'example.test' },
    user: { name: 'person@example.test', displayName: 'person@example.test', id: 'dXNlcg' },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
    authenticatorSelection: { userVerification: 'discouraged' },
  },
});

export const WEBAUTHN_LOGIN_OPTIONS = JSON.stringify({
  publicKey: {
    challenge: 'bG9naW4tY2hhbGxlbmdl',
    rpId: 'example.test',
    allowCredentials: [{ type: 'public-key', id: 'a2V5LTE' }],
    userVerification: 'discouraged',
  },
});

const csrf = input('default', 'csrf_token', 'hidden', 'csrf-value');

/** A login flow after the password step: `requested_aal: aal2`, the three second-factor methods offered. */
export const aal2LoginFlow = {
  id: 'login-aal2',
  type: 'browser',
  requested_aal: 'aal2',
  return_to: 'https://alkem.io/api/auth/oidc/login?login_challenge=abc',
  ui: {
    action: 'https://identity.example.test/self-service/login?flow=login-aal2',
    method: 'POST',
    messages: [],
    nodes: [
      csrf,
      input('default', 'identifier', 'hidden', 'person@example.test'),
      input(
        'totp',
        'totp_code',
        'text',
        '',
        { required: true, autocomplete: 'one-time-code' },
        {
          id: 1010006,
          text: 'Authentication code',
        }
      ),
      input('totp', 'method', 'submit', 'totp', {}, { id: 1010009, text: 'Use Authenticator' }),
      input(
        'lookup_secret',
        'lookup_secret',
        'text',
        '',
        { required: true },
        { id: 1010007, text: 'Backup recovery code' }
      ),
      input(
        'lookup_secret',
        'method',
        'submit',
        'lookup_secret',
        {},
        { id: 1010010, text: 'Use backup recovery code' }
      ),
      input('webauthn', 'webauthn_login', 'hidden', ''),
      input(
        'webauthn',
        'webauthn_login_trigger',
        'button',
        WEBAUTHN_LOGIN_OPTIONS,
        { onclickTrigger: 'oryWebAuthnLogin' },
        { id: 1010008, text: 'Use security key' }
      ),
      script('webauthn', 'webauthn_script'),
    ],
  },
} as unknown as LoginFlow;

/** A first-factor login flow offering passkeys (no second-factor nodes). */
export const passkeyLoginFlow = {
  id: 'login-aal1',
  type: 'browser',
  requested_aal: 'aal1',
  ui: {
    action: 'https://identity.example.test/self-service/login?flow=login-aal1',
    method: 'POST',
    messages: [],
    nodes: [
      csrf,
      input('default', 'identifier', 'text', '', { required: true }, { id: 1070004, text: 'E-Mail' }),
      input('password', 'password', 'password', '', { required: true }, { id: 1070001, text: 'Password' }),
      input('password', 'method', 'submit', 'password', {}, { id: 1010001, text: 'Sign in' }),
      input('passkey', 'passkey_login', 'hidden', ''),
      input(
        'passkey',
        'passkey_login_trigger',
        'button',
        '',
        { onclickTrigger: 'oryPasskeyLogin' },
        { id: 1010021, text: 'Sign in with passkey' }
      ),
      script('passkey', 'passkey_script'),
    ],
  },
} as unknown as LoginFlow;

const settingsNodes = (enrolled: boolean): UiNode[] => [
  csrf,
  ...(enrolled
    ? [input('totp', 'totp_unlink', 'submit', 'true', {}, { id: 1050004, text: 'Unlink TOTP Authenticator App' })]
    : [
        {
          type: 'img',
          group: 'totp',
          attributes: {
            node_type: 'img',
            id: 'totp_qr',
            src: 'data:image/png;base64,iVBORw0KGgo=',
            width: 256,
            height: 256,
          },
          messages: [],
          meta: { label: { id: 1050005, type: 'info', text: 'Authenticator app QR code' } },
        } as unknown as UiNode,
        text('totp', 'totp_secret_key', 'JBSWY3DPEHPK3PXP', { secret: 'JBSWY3DPEHPK3PXP' }),
        input('totp', 'totp_code', 'text', '', { required: true }, { id: 1070006, text: 'Verify code' }),
        input('totp', 'method', 'submit', 'totp', {}, { id: 1040009, text: 'Save' }),
      ]),
  text('lookup_secret', 'lookup_secret_codes', 'abcd1234, efgh5678', {
    secrets: [
      { id: 1050009, type: 'info', text: 'abcd1234' },
      { id: 1050009, type: 'info', text: 'efgh5678' },
    ],
  }),
  input(
    'lookup_secret',
    'lookup_secret_regenerate',
    'submit',
    'true',
    {},
    { id: 1050008, text: 'Generate new backup recovery codes' }
  ),
  input(
    'lookup_secret',
    'lookup_secret_reveal',
    'submit',
    'true',
    {},
    { id: 1050005, text: 'Reveal backup recovery codes' }
  ),
  input(
    'lookup_secret',
    'lookup_secret_confirm',
    'submit',
    'true',
    {},
    { id: 1050010, text: 'Confirm backup recovery codes' }
  ),
  input('lookup_secret', 'lookup_secret_disable', 'submit', 'true', {}, { id: 1050016, text: 'Disable this method' }),
  input('lookup_secret', 'method', 'hidden', 'lookup_secret'),
  input('webauthn', 'webauthn_register_displayname', 'text', '', {}, { id: 1050013, text: 'Name of the security key' }),
  input('webauthn', 'webauthn_register', 'hidden', ''),
  input(
    'webauthn',
    'webauthn_register_trigger',
    'button',
    WEBAUTHN_REGISTRATION_OPTIONS,
    { onclickTrigger: 'oryWebAuthnRegistration' },
    { id: 1050012, text: 'Add security key' }
  ),
  ...(enrolled
    ? [
        input(
          'webauthn',
          'webauthn_remove',
          'submit',
          'key-1',
          {},
          {
            id: 1050018,
            text: 'Remove security key "Blue key"',
            context: { display_name: 'Blue key', added_at: '2026-11-01T10:00:00Z' },
          }
        ),
      ]
    : []),
  script('webauthn', 'webauthn_script'),
  input('passkey', 'passkey_settings_register', 'hidden', ''),
  input(
    'passkey',
    'passkey_create_data',
    'button',
    '',
    { onclickTrigger: 'oryPasskeySettingsRegistration' },
    { id: 1050019, text: 'Add passkey' }
  ),
];

/** A settings flow for an identity with no second factor yet. */
export const secondFactorSettingsFlow = {
  id: 'settings-1',
  type: 'browser',
  state: 'show_form',
  return_to: 'https://alkem.io/second-factor',
  ui: {
    action: 'https://identity.example.test/self-service/settings?flow=settings-1',
    method: 'POST',
    messages: [],
    nodes: settingsNodes(false),
  },
} as unknown as SettingsFlow;

/** The same flow for an identity with an authenticator and one security key enrolled. */
export const enrolledSecondFactorSettingsFlow = {
  ...secondFactorSettingsFlow,
  id: 'settings-2',
  ui: {
    ...secondFactorSettingsFlow.ui,
    action: 'https://identity.example.test/self-service/settings?flow=settings-2',
    nodes: settingsNodes(true),
  },
} as unknown as SettingsFlow;
