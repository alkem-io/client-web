import { type ReactNode, useState } from 'react';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { Button } from '@/crd/primitives/button';

type TransferOperationAction = {
  label: string;
  confirmTitle: string;
  confirmDescription: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
  loading?: boolean;
};

type TransferOperationCardProps = {
  title: string;
  description?: string;
  /** Already-translated error message, if any. */
  error?: string;
  /** Resolve fields + resolved-entity info + pickers. */
  children?: ReactNode;
  /** The destructive action; routed through `ConfirmationDialog`. */
  action?: TransferOperationAction;
};

/**
 * One transfer/conversion operation — title, description, the operator's
 * inputs (children), an optional error, and a destructive action gated by
 * `ConfirmationDialog`. Pure presentation.
 */
export function TransferOperationCard({ title, description, error, children, action }: TransferOperationCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-subheader font-semibold">{title}</h3>
        {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
      </div>

      {children}

      {error ? <p className="text-body text-destructive">{error}</p> : null}

      {action ? (
        <>
          <div>
            <Button
              type="button"
              variant="destructive"
              disabled={action.disabled || action.loading}
              aria-busy={action.loading}
              onClick={() => setConfirmOpen(true)}
            >
              {action.label}
            </Button>
          </div>
          <ConfirmationDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            variant="destructive"
            title={action.confirmTitle}
            description={typeof action.confirmDescription === 'string' ? action.confirmDescription : ''}
            confirmLabel={action.confirmLabel}
            loading={action.loading}
            onConfirm={() => {
              action.onConfirm();
              setConfirmOpen(false);
            }}
          />
        </>
      ) : null}
    </div>
  );
}
