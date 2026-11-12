import type { SettingsFlow } from '@ory/kratos-client';
import type {
  TwoStepAuthenticator,
  TwoStepRecoveryCodes,
  TwoStepSecurityKeys,
  TwoStepVerificationSectionProps,
} from '@/crd/components/user/settings/TwoStepVerificationSection';
import { flowDescriptorAdapter } from './flowDescriptorAdapter';

const SECOND_FACTOR_METHODS = new Set(['totp', 'lookup_secret', 'webauthn']);
/** The hidden input Ory's script writes the registration ceremony's result into. */
const WEBAUTHN_RESULT_FIELD = 'webauthn_register';

type TwoStepVerificationModel = Pick<
  TwoStepVerificationSectionProps,
  'authenticator' | 'recoveryCodes' | 'securityKeys' | 'messages'
> & {
  /** The person holds a second factor: an authenticator, a security key or confirmed recovery codes. */
  enrolled: boolean;
  /** The person holds exactly one such factor, so removing it leaves none. */
  soleFactor: boolean;
  /** Fields of each settings submission, anti-CSRF token included, POSTed to `action`. */
  action: string;
  fields: {
    confirmAuthenticator: (code: string) => Record<string, string>;
    removeAuthenticator: () => Record<string, string>;
    generateRecoveryCodes: () => Record<string, string>;
    confirmRecoveryCodes: () => Record<string, string>;
    removeRecoveryCodes: () => Record<string, string>;
    removeSecurityKey: (id: string) => Record<string, string>;
  };
};

/** The identity provider offers at least one second-factor method in this flow. */
export const offersTwoStepVerification = (flow: SettingsFlow): boolean =>
  flow.ui.nodes.some(node => SECOND_FACTOR_METHODS.has(node.group));

/** The two-step verification section's view of a Kratos settings flow (its `totp`, `lookup_secret` and `webauthn` nodes). */
export const adaptTwoStepVerification = (flow: SettingsFlow): TwoStepVerificationModel => {
  const descriptor = flowDescriptorAdapter(flow, 'settings', {
    keepSecondFactor: true,
    // Flow-level messages belong to the method that produced them.
    dropFlowMessages: !SECOND_FACTOR_METHODS.has(flow.active ?? ''),
  });
  const { totp, lookupSecret, webauthn, hidden } = descriptor.groups;
  const csrf = hidden.filter(field => field.name === 'csrf_token');
  const withCsrf = (fields: Record<string, string>) => ({
    ...Object.fromEntries(csrf.map(field => [field.name, field.value])),
    ...fields,
  });

  const authenticator: TwoStepAuthenticator = totp.submits.some(node => node.name === 'totp_unlink')
    ? { kind: 'enrolled' }
    : totp.inputs.some(node => node.name === 'totp_code')
      ? {
          kind: 'available',
          qr: totp.images[0],
          secret: totp.texts.find(node => node.id === 'totp_secret_key')?.text,
          codeError: totp.inputs.flatMap(node => node.messages).find(message => message.type === 'error')?.text,
        }
      : { kind: 'unavailable' };

  const keys = webauthn.submits
    .filter(node => node.name === 'webauthn_remove')
    .map(node => ({ id: node.value, name: String(node.labelContext?.display_name ?? node.label) }));
  const trigger = webauthn.triggers[0];
  const securityKeys: TwoStepSecurityKeys | undefined =
    trigger || keys.length > 0
      ? {
          keys,
          registration: trigger
            ? {
                action: descriptor.action,
                hiddenFields: [
                  ...csrf,
                  { name: 'method', value: 'webauthn' },
                  ...hidden.filter(field => field.name === WEBAUTHN_RESULT_FIELD),
                ],
                resultFieldName: WEBAUTHN_RESULT_FIELD,
                nameFieldName: webauthn.inputs[0]?.name ?? 'webauthn_register_displayname',
                trigger: { name: trigger.name, value: trigger.value },
              }
            : undefined,
        }
      : undefined;

  const lookupNames = new Set(lookupSecret.submits.map(node => node.name));
  const codesNode = lookupSecret.texts.find(node => node.id === 'lookup_secret_codes');
  const secrets = codesNode?.context?.secrets as { text: string }[] | undefined;
  const codes = secrets?.map(secret => secret.text) ?? [];
  const hasOtherFactor = authenticator.kind === 'enrolled' || keys.length > 0;
  const factorCount =
    (authenticator.kind === 'enrolled' ? 1 : 0) + keys.length + (lookupNames.has('lookup_secret_disable') ? 1 : 0);
  const recoveryCodes: TwoStepRecoveryCodes =
    lookupNames.size === 0
      ? { kind: 'unavailable' }
      : lookupNames.has('lookup_secret_confirm')
        ? { kind: 'unconfirmed', codes }
        : lookupNames.has('lookup_secret_disable')
          ? { kind: 'confirmed' }
          : hasOtherFactor
            ? { kind: 'none' }
            : { kind: 'disabled' };

  return {
    authenticator,
    recoveryCodes,
    securityKeys,
    messages: descriptor.messages.map(message => ({ type: message.type, text: message.text })),
    enrolled: factorCount > 0,
    soleFactor: factorCount === 1,
    action: descriptor.action,
    fields: {
      confirmAuthenticator: code => withCsrf({ method: 'totp', totp_code: code }),
      removeAuthenticator: () => withCsrf({ method: 'totp', totp_unlink: 'true' }),
      generateRecoveryCodes: () => withCsrf({ method: 'lookup_secret', lookup_secret_regenerate: 'true' }),
      confirmRecoveryCodes: () => withCsrf({ method: 'lookup_secret', lookup_secret_confirm: 'true' }),
      removeRecoveryCodes: () => withCsrf({ method: 'lookup_secret', lookup_secret_disable: 'true' }),
      removeSecurityKey: id => withCsrf({ method: 'webauthn', webauthn_remove: id }),
    },
  };
};
