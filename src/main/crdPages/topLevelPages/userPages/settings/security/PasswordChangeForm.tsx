import type { SettingsFlow, UiNode } from '@ory/kratos-client';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { KratosRemovedFieldAttributes } from '@/core/auth/authentication/components/Kratos/constants';
import { isSubmittingPasswordFlow } from '@/core/auth/authentication/components/Kratos/helpers';
import KratosConfirmPasswordField from '@/core/auth/authentication/components/Kratos/KratosConfirmPasswordField';
import KratosForm from '@/core/auth/authentication/components/Kratos/KratosForm';
import KratosUI from '@/core/auth/authentication/components/KratosUI';

const isPasswordInputNode = (node: UiNode): boolean =>
  node.group === 'password' && node.attributes.node_type === 'input' && node.attributes.name === 'password';

type PasswordChangeFormProps = {
  flow: SettingsFlow;
  removedFields: ReadonlyArray<KratosRemovedFieldAttributes>;
};

/**
 * Password-change card for the User Security tab.
 *
 * Wraps the Kratos Settings flow's password group with a client-side
 * confirm-password input. Kratos does not enforce a confirm field — the
 * Settings flow has only one `password` input — so the second input
 * lives purely on the client and is validated on submit.
 *
 * Validation rules:
 *   - confirm must equal the password value;
 *   - submit is disabled while the user is still typing the confirm (or
 *     while the password is empty);
 *   - on submit, if the values mismatch we `preventDefault()` the form
 *     submission and surface an inline error on the confirm field.
 *
 * Kratos itself still runs its own password policies on submit (min
 * length, breached-passwords HIBP, identifier-similarity) and surfaces
 * any failures via the standard flow-with-errors response (handled by
 * `useKratosFlow`'s 400 branch). This guard is on top of that.
 */
export const PasswordChangeForm = ({ flow, removedFields }: PasswordChangeFormProps) => {
  const { t } = useTranslation('crd-contributorSettings');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showMismatch, setShowMismatch] = useState(false);

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const submitDisabled = password.length === 0 || confirmPassword.length === 0 || mismatch;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!isSubmittingPasswordFlow(event)) return;
    if (password !== confirmPassword) {
      event.preventDefault();
      event.stopPropagation();
      setShowMismatch(true);
    }
  };

  const handleInputChange = (node: UiNode, value: string) => {
    if (isPasswordInputNode(node)) {
      setPassword(value);
      if (showMismatch) setShowMismatch(false);
    }
  };

  const handleConfirmChange = (value: string) => {
    setConfirmPassword(value);
    if (showMismatch) setShowMismatch(false);
  };

  const helperText =
    (showMismatch || mismatch) && confirmPassword.length > 0 ? t('user.security.password.mismatch') : '';

  return (
    <KratosForm ui={flow.ui} onSubmit={handleSubmit}>
      <KratosUI
        ui={flow.ui}
        removedFields={removedFields}
        flowType="settings"
        onInputChange={handleInputChange}
        submitDisabled={submitDisabled}
      >
        <KratosConfirmPasswordField
          value={confirmPassword}
          onChange={handleConfirmChange}
          label={t('user.security.password.confirmLabel')}
          error={Boolean(helperText)}
          helperText={helperText}
        />
      </KratosUI>
    </KratosForm>
  );
};

export default PasswordChangeForm;
