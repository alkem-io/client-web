import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDialogCloseGuard } from '@/crd/components/dialogs/useDialogCloseGuard';
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
import { Switch } from '@/crd/primitives/switch';

type SetStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The signed-in user's status message; empty when they set none. */
  statusMessage: string;
  /** Saves a new status message; an empty one clears it. */
  onSave: (statusMessage: string) => void;
  /** While off, others never see the user online and there is no status to set. */
  showOnline: boolean;
  /** Applied at once, not on save. */
  onShowOnlineChange: (showOnline: boolean) => void;
};

/** Whether others see the signed-in user online and, while they do, the status message shown on their avatar card. */
export function SetStatusDialog({
  open,
  onOpenChange,
  statusMessage,
  onSave,
  showOnline,
  onShowOnlineChange,
}: SetStatusDialogProps) {
  const { t } = useTranslation('crd-chat');
  // Null until the user types, so each opening starts from the current status.
  const [draft, setDraft] = useState<string | null>(null);

  const close = () => {
    setDraft(null);
    onOpenChange(false);
  };
  const save = (text: string) => {
    onSave(text.trim());
    close();
  };

  const { handleOpenChange, requestClose, guardElement } = useDialogCloseGuard({
    isDirty: showOnline && draft !== null && draft.trim() !== statusMessage,
    onClose: close,
  });

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {/* No corner close: Cancel and Escape close it. */}
        <DialogContent hideClose={true}>
          <DialogHeader>
            <DialogTitle>{statusMessage ? t('status.change') : t('status.set')}</DialogTitle>
          </DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-body-emphasis">{t('status.showOnline')}</p>
              {/* Says what the current position means, so on and off cannot be misread. */}
              <DialogDescription className="mt-0.5">
                {showOnline ? t('status.showOnlineOn') : t('status.showOnlineOff')}
              </DialogDescription>
            </div>
            <Switch checked={showOnline} onCheckedChange={onShowOnlineChange} aria-label={t('status.showOnline')} />
          </div>
          {showOnline ? (
            <form
              className="grid gap-4"
              onSubmit={event => {
                event.preventDefault();
                save(draft ?? statusMessage);
              }}
            >
              <Input
                value={draft ?? statusMessage}
                onChange={event => setDraft(event.target.value)}
                maxLength={100}
                autoFocus={true}
                placeholder={t('status.placeholder')}
                aria-label={t('status.label')}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={requestClose}>
                  {t('actions.cancel')}
                </Button>
                {statusMessage && (
                  <Button type="button" variant="outline" onClick={() => save('')}>
                    {t('status.clear')}
                  </Button>
                )}
                <Button type="submit">{t('status.save')}</Button>
              </DialogFooter>
            </form>
          ) : (
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={requestClose}>
                {t('actions.close')}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      {guardElement}
    </>
  );
}
