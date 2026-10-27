import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDialogCloseGuard } from '@/crd/components/dialogs/useDialogCloseGuard';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';

type SettingsEditorDialogProps = {
  open: boolean;
  title: string;
  /** Unsaved edits exist — closing (Esc, outside click, X, Cancel) asks to discard first. */
  isDirty: boolean;
  canSave: boolean;
  saving: boolean;
  /** Resolves when the write succeeded (the dialog then closes); rejects to keep it open. */
  onSave: () => Promise<void>;
  /** Drops the unsaved edits — called when the user confirms discarding. */
  onDiscard: () => void;
  onClose: () => void;
  /** Extra actions in the header row (e.g. template entry points). */
  headerActions?: ReactNode;
  children: ReactNode;
};

/**
 * Dialog shell for editing a settings block that is previewed inline on the page: scrollable body,
 * Cancel / Save footer, discard-changes guard, closes after a successful save.
 */
export function SettingsEditorDialog({
  open,
  title,
  isDirty,
  canSave,
  saving,
  onSave,
  onDiscard,
  onClose,
  headerActions,
  children,
}: SettingsEditorDialogProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const { handleOpenChange, requestClose, guardElement } = useDialogCloseGuard({
    isDirty,
    onClose: () => {
      onDiscard();
      onClose();
    },
    blockClose: saving,
  });

  const handleSave = async () => {
    try {
      await onSave();
      onClose();
    } catch {
      // Stay open with the edits intact; the failure is reported by the app's GraphQL error handling.
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-3xl">
          <DialogHeader className="shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
              <DialogTitle>{title}</DialogTitle>
              {headerActions && <div className="flex flex-wrap items-center gap-2">{headerActions}</div>}
            </div>
          </DialogHeader>
          {/* Frozen while saving: the consumer clears its buffer once the write resolves, so anything
              typed in the meantime would be silently dropped. */}
          <div inert={saving} aria-busy={saving} className="min-h-0 flex-1 overflow-y-auto">
            {children}
          </div>
          <DialogFooter className="shrink-0">
            <Button type="button" variant="ghost" onClick={requestClose} disabled={saving}>
              {t('dirtyGuard.cancel')}
            </Button>
            <Button type="button" onClick={() => void handleSave()} disabled={!canSave || saving} aria-busy={saving}>
              {saving && <Loader2 aria-hidden="true" className="mr-1.5 size-4 animate-spin" />}
              {saving ? t('community.editDialog.saving') : t('community.editDialog.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {guardElement}
    </>
  );
}
