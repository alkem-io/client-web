import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Label } from '@/crd/primitives/label';
import { RadioGroup, RadioGroupItem } from '@/crd/primitives/radio-group';

/**
 * The three mutually-exclusive ways to apply a Space template's innovation flow
 * over an existing one. Plain string union (NOT a GraphQL enum) — the consumer
 * maps the emitted `ApplyFlowOptions` onto its mutation variables.
 */
const REPLACE_ALL = 'replace_all';
const ADD_TEMPLATE_POSTS = 'add_template';
const FLOW_ONLY = 'flow_only';

type FlowReplaceOption = typeof REPLACE_ALL | typeof ADD_TEMPLATE_POSTS | typeof FLOW_ONLY;

/** What the consumer needs to drive the replace mutation. */
export type ApplyFlowOptions = {
  /** Seed the new flow with the template's Posts. */
  addCallouts: boolean;
  /** Delete the space's existing Posts before applying (the destructive path). */
  deleteExistingCallouts: boolean;
};

export type CrdApplySpaceTemplateDialogProps = {
  open: boolean;
  /** Dismiss the apply layer (Cancel / X / Esc). */
  onClose: () => void;
  /** Commit — receives the chosen apply options. */
  onConfirm: (options: ApplyFlowOptions) => void;
  /**
   * Number of Posts currently attached. Drives whether the destructive
   * "replace all" path shows the delete confirmation — when 0, there is
   * nothing to delete so the confirm is skipped.
   */
  existingCalloutsCount?: number;
};

const OPTIONS = [
  {
    value: REPLACE_ALL,
    labelKey: 'layout.replaceFlow.applyDialog.option1.label',
    descriptionKey: 'layout.replaceFlow.applyDialog.option1.description',
  },
  {
    value: ADD_TEMPLATE_POSTS,
    labelKey: 'layout.replaceFlow.applyDialog.option2.label',
    descriptionKey: 'layout.replaceFlow.applyDialog.option2.description',
  },
  {
    value: FLOW_ONLY,
    labelKey: 'layout.replaceFlow.applyDialog.option3.label',
    descriptionKey: 'layout.replaceFlow.applyDialog.option3.description',
  },
] as const;

/**
 * CRD replacement for the MUI `ApplySpaceTemplateDialog`. Lets the admin choose
 * how a newly-picked Space template's innovation flow is applied over the
 * current one (replace-all / add-template-Posts / flow-only). The destructive
 * "replace all" path is gated behind a `ConfirmationDialog` per the CRD
 * deletions rule, but only when there are existing Posts to delete.
 *
 * Purely presentational: no Apollo / domain / GraphQL. Selection state and
 * the confirm-step toggle are the only local state; the consumer owns the
 * mutation via `onConfirm`.
 */
export function CrdApplySpaceTemplateDialog({
  open,
  onClose,
  onConfirm,
  existingCalloutsCount = 0,
}: CrdApplySpaceTemplateDialogProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const [selectedOption, setSelectedOption] = useState<FlowReplaceOption>(ADD_TEMPLATE_POSTS);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Reset to the safe default each time the dialog opens so a previous run's
  // destructive pick never carries over.
  useEffect(() => {
    if (open) {
      setSelectedOption(ADD_TEMPLATE_POSTS);
      setConfirmDeleteOpen(false);
    }
  }, [open]);

  const hasExistingCallouts = existingCalloutsCount > 0;

  const emitConfirm = () => {
    onClose();
    onConfirm({
      addCallouts: selectedOption !== FLOW_ONLY,
      deleteExistingCallouts: selectedOption === REPLACE_ALL,
    });
  };

  const handleApply = () => {
    // Only the destructive replace-all path with Posts to lose needs the confirm.
    if (selectedOption === REPLACE_ALL && hasExistingCallouts) {
      setConfirmDeleteOpen(true);
      return;
    }
    emitConfirm();
  };

  const handleConfirmDelete = () => {
    setConfirmDeleteOpen(false);
    emitConfirm();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={next => !next && onClose()}>
        <DialogContent className="sm:max-w-md md:max-w-lg max-h-[90vh] flex flex-col overflow-hidden [&>*]:min-w-0">
          <DialogHeader className="shrink-0">
            <DialogTitle>{t('layout.replaceFlow.applyDialog.title')}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2 flex-1 min-h-0 overflow-y-auto">
            <p className="text-body">
              <Trans
                t={t}
                i18nKey="layout.replaceFlow.applyDialog.description"
                components={{ b: <strong />, br: <br /> }}
              />
            </p>

            <RadioGroup
              value={selectedOption}
              onValueChange={next => setSelectedOption(next as FlowReplaceOption)}
              aria-label={t('layout.replaceFlow.applyDialog.title')}
            >
              {OPTIONS.map(option => (
                <div key={option.value} className="flex items-start gap-3">
                  <RadioGroupItem
                    value={option.value}
                    id={`flow-replace-${option.value}`}
                    aria-describedby={`flow-replace-${option.value}-description`}
                    className="mt-1"
                  />
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor={`flow-replace-${option.value}`} className="text-body-emphasis font-bold">
                      {t(option.labelKey)}
                    </Label>
                    <p id={`flow-replace-${option.value}-description`} className="text-caption text-muted-foreground">
                      {t(option.descriptionKey)}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <DialogFooter className="shrink-0">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t('layout.replaceFlow.applyDialog.cancel')}
            </Button>
            <Button type="button" onClick={handleApply}>
              {t('layout.replaceFlow.applyDialog.apply')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={confirmDeleteOpen}
        onOpenChange={next => !next && setConfirmDeleteOpen(false)}
        variant="destructive"
        title={t('layout.replaceFlow.applyDialog.confirmDelete.title')}
        description={t('layout.replaceFlow.applyDialog.confirmDelete.description')}
        confirmLabel={t('layout.replaceFlow.applyDialog.confirmDelete.confirm')}
        cancelLabel={t('layout.replaceFlow.applyDialog.confirmDelete.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </>
  );
}
