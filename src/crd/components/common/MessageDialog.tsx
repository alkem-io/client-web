import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDialogCloseGuard } from '@/crd/components/dialogs/useDialogCloseGuard';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Textarea } from '@/crd/primitives/textarea';

export type MessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Resolved promise = success (dialog closes, draft cleared); rejection = failure (draft kept, error shown). */
  onSendMessage: (messageText: string) => Promise<void>;
  title: string;
  notice: string;
  placeholder: string;
};

/**
 * Controlled compose dialog for a card menu's "Message" action against a
 * recipient that has no dedicated trigger of its own to bind a popover to
 * (an organisation). Reuses the existing `crd-profilePages`
 * `common.messagePopover.*` keys — no new copy — so the wording, the
 * discard-on-close behaviour and the error/success handling match
 * `MessagePopover` exactly; `MessagePopover` itself is untouched.
 */
export function MessageDialog({ open, onOpenChange, onSendMessage, title, notice, placeholder }: MessageDialogProps) {
  const { t } = useTranslation('crd-profilePages');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = draft.trim().length > 0;

  const reset = () => {
    setDraft('');
    setError(null);
    setSending(false);
  };

  const { handleOpenChange, requestClose, guardElement } = useDialogCloseGuard({
    isDirty,
    onClose: () => {
      reset();
      onOpenChange(false);
    },
    blockClose: sending,
  });

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      await onSendMessage(trimmed);
      reset();
      onOpenChange(false);
    } catch (err) {
      setSending(false);
      setError(err instanceof Error ? err.message : t('common.messagePopover.errorTitle'));
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              // Cmd+Enter (macOS) / Ctrl+Enter (elsewhere) sends — matches MessagePopover.
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={placeholder}
            className="min-h-24"
            disabled={sending}
            aria-label={t('common.messagePopover.ariaLabel')}
          />
          <p className="text-caption text-muted-foreground">{notice}</p>
          {error ? (
            <p role="alert" className="text-caption text-destructive">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={requestClose} disabled={sending}>
              {t('common.messagePopover.cancel')}
            </Button>
            <Button type="button" onClick={handleSend} disabled={!isDirty || sending} aria-busy={sending}>
              {sending ? t('common.messagePopover.sending') : t('common.messagePopover.send')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {guardElement}
    </>
  );
}
