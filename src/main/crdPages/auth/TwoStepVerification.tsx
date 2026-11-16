import type { SettingsFlow } from '@ory/kratos-client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TwoStepVerificationSection } from '@/crd/components/user/settings/TwoStepVerificationSection';
import { invokePasskeyTrigger, translatePasskeyError } from './passkeyTrigger';
import { postKratosForm } from './postKratosForm';
import { submitKratosSettings } from './submitKratosSettings';
import { adaptTwoStepVerification } from './twoStepVerificationModel';
import { useKratosMessageCopy } from './useKratosMessageCopy';

type TwoStepVerificationProps = {
  flow: SettingsFlow;
  /** A rule requires a second factor of this person (removing the last one warns). */
  requirementCovered?: boolean;
  /** Kratos answered a submission with this flow, which the section now shows. */
  onFlowChange?: (flow: SettingsFlow) => void;
};

/**
 * The two-step verification section wired to a Kratos settings flow. Every
 * action is submitted to the flow as JSON and the section shows the flow Kratos
 * answers with, outcome messages included, without reloading the page; when
 * Kratos sends the browser elsewhere first (re-confirming an old session), the
 * browser goes. An answer that is neither falls back to a native POST, which
 * lets Kratos render the outcome itself. A security key is registered through
 * Ory's script, which submits its own form.
 */
export const TwoStepVerification = ({ flow, requirementCovered, onFlowChange }: TwoStepVerificationProps) => {
  const { t } = useTranslation();
  const { t: tSettings } = useTranslation('crd-contributorSettings');
  const translateKratosMessages = useKratosMessageCopy();
  const [securityKeyError, setSecurityKeyError] = useState<string>();
  // Kratos's latest answer wins until the page hands in another flow. The answer may carry a new id:
  // a submission to a flow Kratos has already completed is answered on a fresh one.
  const [answered, setAnswered] = useState<{ to: SettingsFlow; flow: SettingsFlow }>();
  const current = answered?.to === flow ? answered.flow : flow;
  const model = adaptTwoStepVerification(current);
  const post = (fields: Record<string, string>) =>
    submitKratosSettings(model.action, fields).then(
      outcome => {
        if (outcome.kind === 'redirect') {
          window.location.assign(outcome.to);
          return;
        }
        setAnswered({ to: flow, flow: outcome.flow });
        onFlowChange?.(outcome.flow);
      },
      () => postKratosForm(model.action, fields)
    );

  // Kratos's only refusal of a key's name is a missing one; its own text names the form field.
  const registration = model.securityKeys?.registration;
  const securityKeys =
    registration?.nameError && model.securityKeys
      ? {
          ...model.securityKeys,
          registration: { ...registration, nameError: tSettings('user.security.twoStep.securityKeys.nameRequired') },
        }
      : model.securityKeys;

  const flowMessages = translateKratosMessages(model.messages).map(({ type, text }) => ({ type, text }));
  const messages = securityKeyError
    ? [...flowMessages, { type: 'error' as const, text: securityKeyError }]
    : flowMessages;

  return (
    <TwoStepVerificationSection
      authenticator={model.authenticator}
      recoveryCodes={model.recoveryCodes}
      securityKeys={securityKeys}
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
