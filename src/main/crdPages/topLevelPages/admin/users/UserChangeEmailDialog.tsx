import { useState } from 'react';
import { type ChangeEmailFields, ChangeUserEmailDialog } from '@/crd/components/admin/users/ChangeUserEmailDialog';
import useChangeUserEmail from '@/domain/platformAdmin/domain/users/emailChange/useChangeUserEmail';

type UserChangeEmailDialogProps = {
  userId: string;
  currentEmail: string;
  onClose: () => void;
};

const EMPTY: ChangeEmailFields = {
  newEmail: '',
  confirmEmail: '',
  reason: '',
  approverName: '',
  approverRole: '',
  approverOrg: '',
};

/**
 * Integration connector for the change-user-email dialog. Owns the form state
 * and reuses the MUI-free `useChangeUserEmail` hook (mutation + error mapping +
 * notification). Mounted only while a user is selected, so the hook runs scoped
 * to that user.
 */
export function UserChangeEmailDialog({ userId, currentEmail, onClose }: UserChangeEmailDialogProps) {
  const { changeEmail, loading, errorMessage } = useChangeUserEmail(userId);
  const [values, setValues] = useState<ChangeEmailFields>(EMPTY);

  const isDirty = Object.values(values).some(value => value.trim() !== '');

  const handleChange = (field: keyof ChangeEmailFields, value: string) =>
    setValues(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    void changeEmail({
      newEmail: values.newEmail,
      reason: values.reason,
      approver: {
        name: values.approverName,
        role: values.approverRole,
        organization: values.approverOrg,
      },
    }).then(success => {
      if (success) onClose();
    });
  };

  return (
    <ChangeUserEmailDialog
      open={true}
      onOpenChange={open => {
        if (!open) onClose();
      }}
      currentEmail={currentEmail}
      values={values}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitting={loading}
      errorMessage={errorMessage}
      isDirty={isDirty}
    />
  );
}
