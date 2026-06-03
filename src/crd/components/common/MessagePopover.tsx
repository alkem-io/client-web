import { Mail } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/crd/primitives/popover';
import { Textarea } from '@/crd/primitives/textarea';

export type MessagePopoverProps = {
  /**
   * Called when the user submits the message. Resolved promise = success
   * (popover closes, draft cleared); rejection = failure (draft preserved,
   * inline error shown).
   */
  onSendMessage: (messageText: string) => Promise<void>;
  /** Trigger button label (e.g., "Message"). */
  triggerLabel: string;
  /**
   * Optional override of the trigger button. When omitted, a primary button
   * with a Mail icon and `triggerLabel` is rendered.
   */
  triggerVariant?: 'default' | 'secondary' | 'outline' | 'ghost';
  className?: string;
};

export function MessagePopover({
  onSendMessage,
  triggerLabel,
  triggerVariant = 'default',
  className,
}: MessagePopoverProps) {
  const { t } = useTranslation('crd-profilePages');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setDraft('');
    setError(null);
    setSending(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      // closing without submit discards draft (per state-machine)
      reset();
    }
  };

  const handleSend = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      await onSendMessage(draft.trim());
      setSending(false);
      setDraft('');
      setOpen(false);
    } catch (err) {
      setSending(false);
      setError(err instanceof Error ? err.message : t('common.messagePopover.errorTitle'));
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild={true}>
        <Button variant={triggerVariant} className={cn('gap-2 shadow-sm', className)} aria-haspopup="dialog">
          <Mail className="w-4 h-4" aria-hidden="true" />
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="end" aria-label={t('common.messagePopover.ariaLabel')}>
        <p className="text-body-emphasis mb-2">{t('common.messagePopover.emailTitle')}</p>
        <Textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            // Cmd+Enter on macOS, Ctrl+Enter elsewhere — same key event in
            // both cases (metaKey on mac, ctrlKey otherwise). Submitting on
            // a chord rather than plain Enter lets the user keep typing
            // multi-line drafts without an accidental send.
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={t('common.messagePopover.placeholder')}
          className="min-h-24"
          disabled={sending}
          aria-label={t('common.messagePopover.ariaLabel')}
        />
        <p className="text-caption text-muted-foreground mt-2">{t('common.messagePopover.emailNotice')}</p>
        {error ? (
          <p role="alert" className="text-caption text-destructive mt-2">
            {error}
          </p>
        ) : null}
        <div className="flex items-center justify-end gap-2 mt-3">
          <Button type="button" variant="ghost" size="sm" onClick={() => handleOpenChange(false)} disabled={sending}>
            {t('common.messagePopover.cancel')}
          </Button>
          <Button type="button" size="sm" onClick={handleSend} disabled={!draft.trim() || sending} aria-busy={sending}>
            {sending ? t('common.messagePopover.sending') : t('common.messagePopover.send')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
