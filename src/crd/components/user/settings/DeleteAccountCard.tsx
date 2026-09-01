import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import type { DeleteAccountDialogState } from './DeleteAccount.types';
import { DeleteAccountBlockedDialog } from './DeleteAccountBlockedDialog';

const NS = 'crd-contributorSettings';

export type DeleteAccountCardProps = {
  /** The user's exact displayed name — what the confirm dialog requires to be typed verbatim (FR-002). */
  displayName: string;
  dialog: DeleteAccountDialogState;
  /** Runs the pre-flight read and opens the confirm/blocked dialog (or routes to re-auth first — the connector decides before this ever renders a dialog). */
  onOpen: () => void;
  onTypedNameChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onDialogOpenChange: (open: boolean) => void;
  /** Deep-links to the existing account-resources management page. */
  accountResourcesUrl: string;
};

/**
 * Delete-account card for the User Security tab (FR-001). Presentational —
 * driven entirely by the `dialog` state machine the connector owns:
 * closed → preflight-loading → {blocked | confirm} → deleting. A stale
 * session never reaches this component's dialogs at all — the connector
 * routes to re-authentication before opening either one (US3).
 */
export function DeleteAccountCard({
  displayName,
  dialog,
  onOpen,
  onTypedNameChange,
  onConfirm,
  onCancel,
  onDialogOpenChange,
  accountResourcesUrl,
}: DeleteAccountCardProps) {
  const { t } = useTranslation(NS);

  const preflightLoading = dialog.kind === 'preflight-loading';

  return (
    <div className="flex flex-col gap-4">
      <p className="text-body text-muted-foreground">{t('user.security.deleteAccount.cardBody')}</p>
      {dialog.kind === 'preflight-error' ? (
        <p role="alert" className="text-body text-destructive">
          {t('user.security.deleteAccount.preflightError')}
        </p>
      ) : null}
      {dialog.kind === 'reauth-failed' ? (
        <p role="alert" className="text-body text-destructive">
          {t('user.security.deleteAccount.reauthFailed')}
        </p>
      ) : null}
      <div>
        <Button
          type="button"
          variant="destructive"
          onClick={onOpen}
          disabled={preflightLoading}
          aria-busy={preflightLoading}
        >
          {t('user.security.deleteAccount.trigger')}
        </Button>
      </div>

      <ConfirmationDialog
        open={dialog.kind === 'confirm'}
        onOpenChange={onDialogOpenChange}
        title={t('user.security.deleteAccount.confirm.title')}
        description={t('user.security.deleteAccount.confirm.description')}
        confirmLabel={
          dialog.kind === 'confirm' && dialog.deleting
            ? t('user.security.deleteAccount.confirm.deleting')
            : t('user.security.deleteAccount.confirm.confirmLabel')
        }
        cancelLabel={t('user.security.deleteAccount.confirm.cancel')}
        onConfirm={onConfirm}
        onCancel={onCancel}
        variant="destructive"
        loading={dialog.kind === 'confirm' && dialog.deleting}
        // A missing/unresolved displayName ('') must never satisfy the typed-name
        // guard by comparing equal to an empty typed field — fail closed instead.
        confirmDisabled={
          dialog.kind === 'confirm' && (displayName.length === 0 || dialog.typedName.trim() !== displayName)
        }
      >
        {dialog.kind === 'confirm' ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="delete-account-typed-name">
              {t('user.security.deleteAccount.confirm.instructions', { name: displayName })}
            </Label>
            <Input
              id="delete-account-typed-name"
              value={dialog.typedName}
              onChange={event => onTypedNameChange(event.target.value)}
              placeholder={t('user.security.deleteAccount.confirm.namePlaceholder')}
              disabled={dialog.deleting}
              autoComplete="off"
            />
            {dialog.externalSubscriptionLinked ? (
              <p className="text-caption text-muted-foreground">
                {t('user.security.deleteAccount.confirm.subscriptionNotice')}
              </p>
            ) : null}
            {dialog.error ? (
              <p role="alert" className="text-caption text-destructive">
                {t('user.security.deleteAccount.confirm.genericError')}
              </p>
            ) : null}
          </div>
        ) : null}
      </ConfirmationDialog>

      <DeleteAccountBlockedDialog
        open={dialog.kind === 'blocked'}
        onOpenChange={onDialogOpenChange}
        blockers={dialog.kind === 'blocked' ? dialog.blockers : []}
        totals={dialog.kind === 'blocked' ? dialog.totals : []}
        truncated={dialog.kind === 'blocked' && dialog.truncated}
        accountResourcesUrl={accountResourcesUrl}
      />
    </div>
  );
}
