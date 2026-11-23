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

type SetStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The signed-in user's status message; empty when they set none. */
  statusMessage: string;
  /** Saves a new status message; an empty one clears it. */
  onSave: (statusMessage: string) => void;
};

/** Sets, edits or clears the signed-in user's status message, which others see on their avatar card. */
export function SetStatusDialog({ open, onOpenChange, statusMessage, onSave }: SetStatusDialogProps) {
  const { t } = useTranslation('crd-chat');

  const save = (text: string) => {
    onSave(text.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* No corner close: Cancel and Escape close it. */}
      <DialogContent hideClose={true}>
        <DialogHeader>
          <DialogTitle>{statusMessage ? t('status.change') : t('status.set')}</DialogTitle>
          <DialogDescription>{t('status.hint')}</DialogDescription>
        </DialogHeader>
        {/* The content mounts on every open, so the field starts from the current status each time. */}
        <form
          className="grid gap-4"
          onSubmit={event => {
            event.preventDefault();
            save(String(new FormData(event.currentTarget).get('statusMessage')));
          }}
        >
          <Input
            name="statusMessage"
            defaultValue={statusMessage}
            maxLength={100}
            autoFocus={true}
            placeholder={t('status.placeholder')}
            aria-label={t('status.label')}
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
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
      </DialogContent>
    </Dialog>
  );
}
