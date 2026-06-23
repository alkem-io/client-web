import { Send } from 'lucide-react';
import { type ReactNode, useId } from 'react';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';
import { Textarea } from '@/crd/primitives/textarea';

export type DirectMessageReceiver = {
  id: string;
  displayName?: string;
  city?: string;
  country?: string;
  avatarUrl?: string;
};

export type DirectMessageDialogLabels = {
  /** Textarea label + placeholder. */
  messageLabel: string;
  /** Caption shown below the textarea (e.g. email-visibility warning). */
  warning: string;
  /** Confirmation shown once a message has been sent. */
  successLabel: string;
  /** Send button label. */
  sendLabel: string;
  /** Accessible label for the dialog close (X) button. */
  closeLabel: string;
};

export type DirectMessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog title — business text supplied by the consumer. */
  title: ReactNode;
  receivers?: DirectMessageReceiver[];
  /** Live message value (controlled by the consumer). */
  value: string;
  onValueChange: (value: string) => void;
  /** Max characters allowed in the message. */
  maxLength: number;
  /** True while the send mutation is in flight. */
  sending?: boolean;
  /** True once a message has been sent successfully — shows the success note. */
  sent?: boolean;
  onSend: () => void;
  labels: DirectMessageDialogLabels;
  className?: string;
};

/**
 * Pure CRD presentational dialog for sending a direct message to one or more
 * contributors. Owns no business logic — the consumer holds the message value,
 * the send mutation, the loading/sent flags, and all i18n text (passed via
 * `labels`, since these strings live in the legacy `translation` namespace).
 */
export function DirectMessageDialog({
  open,
  onOpenChange,
  title,
  receivers,
  value,
  onValueChange,
  maxLength,
  sending = false,
  sent = false,
  onSend,
  labels,
  className,
}: DirectMessageDialogProps) {
  const textareaId = useId();
  const sendDisabled = sending || value.trim().length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden', className)}
        closeLabel={labels.closeLabel}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">
          {receivers && receivers.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {receivers.map(receiver => (
                <ReceiverChip key={receiver.id} receiver={receiver} />
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-body-emphasis text-foreground" htmlFor={textareaId}>
              {labels.messageLabel}
            </label>
            <Textarea
              id={textareaId}
              value={value}
              onChange={event => onValueChange(event.target.value)}
              placeholder={labels.messageLabel}
              aria-label={labels.messageLabel}
              maxLength={maxLength}
              rows={5}
              className="min-h-[8rem]"
              disabled={sending}
            />
          </div>

          <DialogDescription className="text-caption text-muted-foreground">{labels.warning}</DialogDescription>
        </div>

        <DialogFooter className="shrink-0 flex-row items-center justify-end gap-3 sm:justify-end">
          {sent && <output className="mr-auto text-caption text-success">{labels.successLabel}</output>}
          <Button type="button" disabled={sendDisabled} aria-busy={sending} onClick={onSend} className="gap-2">
            <Send className="size-4" aria-hidden="true" />
            {labels.sendLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReceiverChip({ receiver }: { receiver: DirectMessageReceiver }) {
  const displayName = receiver.displayName ?? '';
  const initial = displayName.slice(0, 1).toUpperCase();
  const location = [receiver.city, receiver.country].filter(Boolean).join(', ');

  return (
    <li className="flex items-center gap-2 rounded-md border border-border px-2 py-1">
      <Avatar className="size-8">
        {receiver.avatarUrl && <AvatarImage src={receiver.avatarUrl} alt="" />}
        <AvatarFallback className="text-badge">{initial}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="text-control truncate" title={displayName}>
          {displayName}
        </p>
        {location && <p className="text-caption text-muted-foreground truncate">{location}</p>}
      </div>
    </li>
  );
}
