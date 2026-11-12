import type { SettingsFlow } from '@ory/kratos-client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TwoStepVerificationSection } from '@/crd/components/user/settings/TwoStepVerificationSection';
import { invokePasskeyTrigger, translatePasskeyError } from './passkeyTrigger';
import { postKratosForm } from './postKratosForm';
import { adaptTwoStepVerification } from './twoStepVerificationModel';
import { useKratosMessageCopy } from './useKratosMessageCopy';

type TwoStepVerificationProps = {
  flow: SettingsFlow;
  /** A rule requires a second factor of this person (removing the last one warns). */
  requirementCovered?: boolean;
};

/**
 * The two-step verification section wired to a Kratos settings flow. Every
 * action is a native POST to the flow (so Kratos's privileged-session
 * re-confirmation and outcome messages work as for every settings form); a
 * security key is registered through Ory's script, which submits its own form.
 */
export const TwoStepVerification = ({ flow, requirementCovered }: TwoStepVerificationProps) => {
  const { t } = useTranslation();
  const translateKratosMessages = useKratosMessageCopy();
  const [securityKeyError, setSecurityKeyError] = useState<string>();
  const model = adaptTwoStepVerification(flow);
  const post = (fields: Record<string, string>) => postKratosForm(model.action, fields);

  const flowMessages = translateKratosMessages(model.messages).map(({ type, text }) => ({ type, text }));
  const messages = securityKeyError
    ? [...flowMessages, { type: 'error' as const, text: securityKeyError }]
    : flowMessages;

  return (
    <TwoStepVerificationSection
      authenticator={model.authenticator}
      recoveryCodes={model.recoveryCodes}
      securityKeys={model.securityKeys}
      messages={messages}
      warnOnLastFactor={Boolean(requirementCovered) && model.soleFactor}
      onConfirmAuthenticator={code => post(model.fields.confirmAuthenticator(code))}
      onRemoveAuthenticator={() => post(model.fields.removeAuthenticator())}
      onGenerateRecoveryCodes={() => post(model.fields.generateRecoveryCodes())}
      onConfirmRecoveryCodes={() => post(model.fields.confirmRecoveryCodes())}
      onRemoveRecoveryCodes={() => post(model.fields.removeRecoveryCodes())}
      onRemoveSecurityKey={id => post(model.fields.removeSecurityKey(id))}
      onAddSecurityKey={value => {
        setSecurityKeyError(undefined);
        invokePasskeyTrigger('oryWebAuthnRegistration', value).catch(error =>
          setSecurityKeyError(translatePasskeyError(t, error))
        );
      }}
    />
  );
};
