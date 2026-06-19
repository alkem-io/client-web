import { CheckCircle2, MessageSquare } from 'lucide-react';
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

export type SendConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Display names of recipients the message could NOT be delivered to (FR-013). */
  notReached?: string[];
  /** When provided, an "Open chat" action is rendered. */
  onOpenChat?: () => void;
};

/**
 * Reusable confirmation shown after a private-message send (Share on Alkemio,
 * Contact the leads). Confirms the message was sent, optionally offers to open
 * the chat, and lists any recipients who could not be reached rather than
 * reporting a blanket success (FR-005, FR-013).
 */
export function SendConfirmationDialog({ open, onOpenChange, notReached, onOpenChat }: SendConfirmationDialogProps) {
  const { t } = useTranslation('crd-chat');
  const hasFailures = Boolean(notReached && notReached.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={t('actions.cancel')}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
            {t('sendConfirmation.title')}
          </DialogTitle>
          <DialogDescription>
            {hasFailures ? t('sendConfirmation.partialDescription') : t('sendConfirmation.description')}
          </DialogDescription>
        </DialogHeader>

        {hasFailures ? (
          <div className="rounded-md border border-border bg-muted px-3 py-2">
            <p className="text-body-emphasis text-foreground">{t('sendConfirmation.notReachedTitle')}</p>
            <ul className="mt-1 list-disc pl-5 text-body text-muted-foreground">
              {notReached?.map(name => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {t('sendConfirmation.close')}
          </Button>
          {onOpenChat ? (
            <Button type="button" onClick={onOpenChat} className="gap-2">
              <MessageSquare className="size-4" aria-hidden="true" />
              {t('sendConfirmation.openChat')}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
