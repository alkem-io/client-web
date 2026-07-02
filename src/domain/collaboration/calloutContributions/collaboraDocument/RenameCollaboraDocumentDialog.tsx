import { Loader2 } from 'lucide-react';
import { type KeyboardEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { useRenameCollaboraDocument } from './useRenameCollaboraDocument';

type RenameCollaboraDocumentDialogProps = {
  open: boolean;
  collaboraDocumentId: string;
  /** Current display name (seed). */
  displayName: string;
  onClose: () => void;
};

/**
 * Standalone "Rename document" dialog — the entry point reachable from the
 * per-callout context menu, so a user who can edit the document (but not the
 * callout) can rename without opening the callout edit dialog. Single name
 * field + Save/Cancel, backed by `useRenameCollaboraDocument`.
 */
export function RenameCollaboraDocumentDialog({
  open,
  collaboraDocumentId,
  displayName,
  onClose,
}: RenameCollaboraDocumentDialogProps) {
  const { t } = useTranslation('crd-space');
  // The dialog is only rendered for permitted users (menu-item gate), so rename is allowed here.
  const { draft, saving, error, changeDraft, save, startEdit, cancel } = useRenameCollaboraDocument({
    collaboraDocumentId,
    displayName,
    canRename: true,
  });

  // Seed the field from the current name whenever the dialog opens. `startEdit` is
  // intentionally excluded from deps — including it would reset the field on every
  // keystroke (it is recreated each render).
  useEffect(() => {
    if (open) {
      startEdit();
    }
  }, [open, displayName]);

  const handleSave = async () => {
    const ok = await save();
    if (ok) {
      onClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (saving) {
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSave();
    }
  };

  const handleCancel = () => {
    cancel();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('collabora.rename.dialogTitle')}</DialogTitle>
          <DialogDescription className="sr-only">{t('collabora.rename.dialogTitle')}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1">
          <Input
            value={draft}
            aria-label={t('collabora.rename.inputLabel')}
            aria-invalid={error ? true : undefined}
            onChange={e => changeDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus={true}
          />
          {error && <p className="text-caption text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            {t('collabora.rename.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {t('collabora.rename.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
