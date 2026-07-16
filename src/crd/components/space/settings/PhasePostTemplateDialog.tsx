import { FileText } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';

type PhasePostTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Display name of the phase — shown in the dialog title for context. */
  phaseName: string;
  /**
   * The currently-set default Post template for this phase, or null/undefined when none.
   * When defined, the "Clear template" affordance is shown.
   */
  currentTemplate?: { id: string; displayName: string } | null;
  /** Called when the admin picks "Choose template…" — consumer opens the template picker. */
  onChooseTemplate: () => void;
  /** Called when the admin confirms clearing the template — consumer fires the mutation. */
  onClearTemplate: () => void;
};

/**
 * Per-phase Post Template modal (US3, FR-010/FR-012).
 * Presentational CRD component — no GraphQL or business logic inside.
 *
 * Offers:
 *   - "Choose template…" — always shown, opens the picker via callback.
 *   - "Clear template" — shown only when a default template is already set;
 *     requires explicit confirmation before the handler fires (FR-012).
 *
 * The confirmation guard for "Clear template" is integrated here so the
 * dialog stays self-contained (the consumer doesn't need to manage it).
 */
export function PhasePostTemplateDialog({
  open,
  onOpenChange,
  phaseName,
  currentTemplate,
  onChooseTemplate,
  onClearTemplate,
}: PhasePostTemplateDialogProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const hasTemplate = Boolean(currentTemplate);

  const handleChoose = () => {
    onOpenChange(false);
    onChooseTemplate();
  };

  const handleClearRequest = () => {
    setClearConfirmOpen(true);
  };

  const handleClearConfirmed = () => {
    setClearConfirmOpen(false);
    onOpenChange(false);
    onClearTemplate();
  };

  const handleClearCancelled = () => {
    setClearConfirmOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={nextOpen => {
          if (!nextOpen) onOpenChange(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText aria-hidden="true" className="size-4" />
              {t('layout.column.postTemplate.dialogTitle', { phaseName })}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2">
            <Button type="button" variant="outline" className="justify-start gap-2" onClick={handleChoose}>
              <FileText aria-hidden="true" className="size-4" />
              {t('layout.column.postTemplate.choose')}
            </Button>

            {hasTemplate && (
              <Button
                type="button"
                variant="outline"
                className="justify-start gap-2 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60"
                onClick={handleClearRequest}
              >
                {t('layout.column.postTemplate.clear')}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={clearConfirmOpen}
        onOpenChange={open => {
          if (!open) handleClearCancelled();
        }}
        variant="destructive"
        title={t('layout.column.postTemplate.clearConfirm.title')}
        description={t('layout.column.postTemplate.clearConfirm.description')}
        confirmLabel={t('layout.column.postTemplate.clearConfirm.confirm')}
        cancelLabel={t('layout.column.postTemplate.clearConfirm.cancel')}
        onConfirm={handleClearConfirmed}
        onCancel={handleClearCancelled}
      />
    </>
  );
}
