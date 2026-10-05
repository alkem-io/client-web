import { MessageSquare } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageComposerActions,
  MessageComposerFields,
  useMessageComposer,
} from '@/crd/components/common/MessageComposer';
import { useDialogCloseGuard } from '@/crd/components/dialogs/useDialogCloseGuard';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/crd/primitives/popover';

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
  /** Trigger icon; defaults to a chat-bubble. Pass a `<Mail />` for the email route. */
  triggerIcon?: ReactNode;
  className?: string;
  /** Override the popover heading (defaults to the private-message copy). */
  title?: string;
  /** Override the helper notice under the textarea. */
  notice?: string;
  /** Override the textarea placeholder. */
  placeholder?: string;
};

export function MessagePopover({
  onSendMessage,
  triggerLabel,
  triggerVariant = 'default',
  triggerIcon,
  className,
  title,
  notice,
  placeholder,
}: MessagePopoverProps) {
  const { t } = useTranslation('crd-profilePages');
  const [open, setOpen] = useState(false);
  const composer = useMessageComposer({ onSendMessage, onSent: () => setOpen(false) });

  // Same discard-on-close confirmation as `MessageDialog`. The guard only
  // intercepts closing; opening comes from the trigger, so it is applied here.
  const {
    handleOpenChange: guardedClose,
    requestClose,
    guardElement,
  } = useDialogCloseGuard({
    isDirty: composer.isDirty,
    onClose: () => {
      composer.reset();
      setOpen(false);
    },
    blockClose: composer.sending,
  });

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setOpen(true);
    } else {
      guardedClose(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild={true}>
          <Button variant={triggerVariant} className={cn('gap-2 shadow-sm', className)} aria-haspopup="dialog">
            {triggerIcon ?? <MessageSquare className="w-4 h-4" aria-hidden="true" />}
            {triggerLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="end" aria-label={t('common.messagePopover.ariaLabel')}>
          <p className="text-body-emphasis mb-2">{title ?? t('common.messagePopover.title')}</p>
          <MessageComposerFields
            composer={composer}
            notice={notice ?? t('common.messagePopover.notice')}
            placeholder={placeholder ?? t('common.messagePopover.placeholder')}
          />
          <div className="flex items-center justify-end gap-2 mt-3">
            <MessageComposerActions composer={composer} onCancel={requestClose} size="sm" />
          </div>
        </PopoverContent>
      </Popover>
      {guardElement}
    </>
  );
}
