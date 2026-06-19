import { Send } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Label } from '@/crd/primitives/label';
import { Textarea } from '@/crd/primitives/textarea';

export type ContactLeadRecipient = {
  id: string;
  displayName: string;
  avatarUrl?: string;
};

export type ContactLeadsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: ContactLeadRecipient[];
  /** Max message length; surfaced as a validation error when exceeded. */
  maxLength: number;
  sending: boolean;
  /** Resolves on success (dialog closes), rejects on failure. */
  onSend: (message: string) => Promise<void>;
};

/**
 * CRD "Contact the leads" dialog (US3). Sends a private message individually to
 * each lead; presentational only — the consumer owns the mutation and the
 * confirmation. Replaces the legacy MUI DirectMessageDialog for this flow.
 */
export function ContactLeadsDialog({
  open,
  onOpenChange,
  recipients,
  maxLength,
  sending,
  onSend,
}: ContactLeadsDialogProps) {
  const { t } = useTranslation('crd-chat');
  const [message, setMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const trimmed = message.trim();
  const error =
    trimmed.length === 0
      ? t('contactLeads.errors.messageRequired')
      : message.length > maxLength
        ? t('contactLeads.errors.messageTooLong', { max: maxLength })
        : null;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setMessage('');
      setShowError(false);
    }
    onOpenChange(next);
  };

  const handleSend = async () => {
    setShowError(true);
    if (error) return;
    await onSend(trimmed);
    setMessage('');
    setShowError(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0" closeLabel={t('contactLeads.cancel')}>
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>{t('contactLeads.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-4">
          <p className="text-body text-muted-foreground">{t('contactLeads.explanation')}</p>

          <div className="flex flex-col gap-2">
            <p className="text-label uppercase text-muted-foreground">{t('contactLeads.recipientsLabel')}</p>
            <ul className="flex flex-wrap gap-2">
              {recipients.map(recipient => (
                <li
                  key={recipient.id}
                  className="flex items-center gap-2 rounded-full border border-border bg-muted px-2 py-1"
                >
                  <Avatar className="size-6">
                    {recipient.avatarUrl ? <AvatarImage src={recipient.avatarUrl} alt={recipient.displayName} /> : null}
                    <AvatarFallback className="text-[10px]">{recipient.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-caption text-foreground">{recipient.displayName}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="contact-leads-message">{t('contactLeads.messageLabel')}</Label>
            <Textarea
              id="contact-leads-message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              maxLength={maxLength}
              placeholder={t('contactLeads.messagePlaceholder')}
              aria-invalid={showError && Boolean(error)}
            />
            {showError && error ? (
              <p role="alert" className="text-caption text-destructive">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} disabled={sending}>
            {t('contactLeads.cancel')}
          </Button>
          <Button type="button" onClick={handleSend} disabled={sending} aria-busy={sending} className="gap-2">
            <Send className="size-4" aria-hidden="true" />
            {sending ? t('contactLeads.sending') : t('contactLeads.send')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
