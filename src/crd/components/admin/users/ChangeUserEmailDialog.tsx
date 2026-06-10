import { AlertTriangle } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useDialogCloseGuard } from '@/crd/components/dialogs/useDialogCloseGuard';
import { AdminFormField } from '@/crd/forms/AdminFormField';
import { isValidEmail } from '@/crd/lib/validators';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Textarea } from '@/crd/primitives/textarea';

export type ChangeEmailFields = {
  newEmail: string;
  confirmEmail: string;
  reason: string;
  approverName: string;
  approverRole: string;
  approverOrg: string;
};

type ChangeUserEmailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string;
  values: ChangeEmailFields;
  onChange: (field: keyof ChangeEmailFields, value: string) => void;
  onSubmit: () => void;
  submitting?: boolean;
  /** Already-translated error message from the mutation, if any. */
  errorMessage?: string;
  isDirty: boolean;
};

/**
 * Platform-admin change-user-email dialog (global-admin only). Mirrors the MUI
 * change-email form: new + confirm email, reason, and approver (name / role /
 * optional organization). Pure presentation — validation enables the submit
 * button; the mutation lives in the integration connector. Guards unsaved input
 * on close via `useDialogCloseGuard`.
 */
export function ChangeUserEmailDialog({
  open,
  onOpenChange,
  currentEmail,
  values,
  onChange,
  onSubmit,
  submitting = false,
  errorMessage,
  isDirty,
}: ChangeUserEmailDialogProps) {
  const { t } = useTranslation('crd-admin');
  const ids = {
    currentEmail: useId(),
    newEmail: useId(),
    confirmEmail: useId(),
    reason: useId(),
    reasonHelp: useId(),
    name: useId(),
    role: useId(),
    org: useId(),
  };

  const { handleOpenChange, requestClose, guardElement } = useDialogCloseGuard({
    isDirty,
    onClose: () => onOpenChange(false),
    blockClose: submitting,
  });

  const emailsMatch = values.confirmEmail === values.newEmail;
  const changed = values.newEmail.trim().toLowerCase() !== currentEmail.trim().toLowerCase();
  const canSubmit =
    isValidEmail(values.newEmail) &&
    emailsMatch &&
    changed &&
    Boolean(values.reason.trim()) &&
    Boolean(values.approverName.trim()) &&
    Boolean(values.approverRole.trim());

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg flex max-h-[90vh] flex-col overflow-hidden" aria-describedby={undefined}>
          <DialogHeader className="shrink-0">
            <DialogTitle>{t('users.changeEmail.title')}</DialogTitle>
          </DialogHeader>

          <form
            className="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto"
            onSubmit={event => {
              event.preventDefault();
              if (canSubmit && !submitting) onSubmit();
            }}
            id="change-email-form"
          >
            <AdminFormField id={ids.currentEmail} label={t('users.changeEmail.currentEmail')}>
              <Input id={ids.currentEmail} value={currentEmail} disabled={true} readOnly={true} />
            </AdminFormField>

            <AdminFormField id={ids.newEmail} label={t('users.changeEmail.newEmail')} required={true}>
              <Input
                id={ids.newEmail}
                type="email"
                value={values.newEmail}
                onChange={e => onChange('newEmail', e.target.value)}
                disabled={submitting}
                required={true}
              />
            </AdminFormField>

            <AdminFormField id={ids.confirmEmail} label={t('users.changeEmail.confirmEmail')} required={true}>
              <Input
                id={ids.confirmEmail}
                type="email"
                value={values.confirmEmail}
                onChange={e => onChange('confirmEmail', e.target.value)}
                disabled={submitting}
                required={true}
                aria-invalid={Boolean(values.confirmEmail) && !emailsMatch}
              />
              {Boolean(values.confirmEmail) && !emailsMatch ? (
                <p className="text-caption text-destructive">{t('users.changeEmail.mismatch')}</p>
              ) : null}
            </AdminFormField>

            <h3 className="text-subheader font-semibold">{t('users.changeEmail.approvalSection')}</h3>

            <AdminFormField id={ids.reason} label={t('users.changeEmail.reason')} required={true}>
              <Textarea
                id={ids.reason}
                rows={3}
                value={values.reason}
                onChange={e => onChange('reason', e.target.value)}
                disabled={submitting}
                required={true}
                aria-describedby={ids.reasonHelp}
              />
              <p id={ids.reasonHelp} className="text-caption text-muted-foreground">
                {t('users.changeEmail.reasonHelp')}
              </p>
            </AdminFormField>

            <AdminFormField id={ids.name} label={t('users.changeEmail.approverName')} required={true}>
              <Input
                id={ids.name}
                value={values.approverName}
                onChange={e => onChange('approverName', e.target.value)}
                disabled={submitting}
                required={true}
              />
            </AdminFormField>

            <AdminFormField id={ids.role} label={t('users.changeEmail.approverRole')} required={true}>
              <Input
                id={ids.role}
                value={values.approverRole}
                onChange={e => onChange('approverRole', e.target.value)}
                disabled={submitting}
                required={true}
              />
            </AdminFormField>

            <AdminFormField id={ids.org} label={t('users.changeEmail.approverOrg')}>
              <Input
                id={ids.org}
                value={values.approverOrg}
                onChange={e => onChange('approverOrg', e.target.value)}
                disabled={submitting}
              />
            </AdminFormField>

            <div
              role="note"
              className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
            >
              <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p className="text-body">{t('users.changeEmail.sessionWarning')}</p>
            </div>

            {errorMessage ? <p className="text-body text-destructive">{errorMessage}</p> : null}
          </form>

          <div className="flex shrink-0 justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={requestClose} disabled={submitting}>
              {t('users.changeEmail.cancel')}
            </Button>
            <Button type="submit" form="change-email-form" disabled={!canSubmit || submitting} aria-busy={submitting}>
              {t('users.changeEmail.submit')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {guardElement}
    </>
  );
}
