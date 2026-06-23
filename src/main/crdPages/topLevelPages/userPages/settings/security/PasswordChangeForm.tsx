import type { SettingsFlow } from '@ory/kratos-client';
import { useTranslation } from 'react-i18next';
import { CrdKratosPasswordCard } from '@/crd/forms/auth/CrdKratosPasswordCard';
import { adaptSettingsPasswordFlow } from './passwordFlowAdapter';

type PasswordChangeFormProps = {
  flow: SettingsFlow;
};

/**
 * Password-change card for the User Security tab.
 *
 * Adapts the Kratos Settings flow's password slice to the MUI-free
 * `CrdKratosPasswordCard`, which renders the native form (hidden CSRF nodes,
 * the `password` input, the `method=password` submit, and flow messages) plus
 * a client-side confirm-password guard. The form POSTs straight to
 * `flow.ui.action`; Kratos enforces its own password policies server-side
 * (min length, breached-passwords HIBP, identifier similarity) and surfaces
 * failures via the standard flow-with-errors response.
 *
 * Kratos's Settings flow has only one `password` input, so the confirm field
 * lives purely on the client and is never serialised into the POST.
 */
export const PasswordChangeForm = ({ flow }: PasswordChangeFormProps) => {
  const { t } = useTranslation('crd-contributorSettings');
  const { t: tAuth } = useTranslation('crd-auth');

  const passwordFlow = adaptSettingsPasswordFlow(flow);
  if (!passwordFlow) return null;

  const passwordField = passwordFlow.passwordField.label
    ? passwordFlow.passwordField
    : { ...passwordFlow.passwordField, label: tAuth('fields.password') };

  return (
    <CrdKratosPasswordCard
      flow={{ ...passwordFlow, passwordField }}
      confirmLabel={t('user.security.password.confirmLabel')}
      mismatchMessage={t('user.security.password.mismatch')}
      showPasswordLabel={tAuth('fields.showPassword')}
      hidePasswordLabel={tAuth('fields.hidePassword')}
    />
  );
};

export default PasswordChangeForm;
