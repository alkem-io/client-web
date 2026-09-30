import {
  MessageComposerActions,
  MessageComposerFields,
  useMessageComposer,
} from '@/crd/components/common/MessageComposer';
import { useDialogCloseGuard } from '@/crd/components/dialogs/useDialogCloseGuard';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';

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
 * (an organisation). Same composer as `MessagePopover`, plus the
 * discard-on-close guard every CRD dialog has.
 */
export function MessageDialog({ open, onOpenChange, onSendMessage, title, notice, placeholder }: MessageDialogProps) {
  const composer = useMessageComposer({ onSendMessage, onSent: () => onOpenChange(false) });

  const { handleOpenChange, requestClose, guardElement } = useDialogCloseGuard({
    isDirty: composer.isDirty,
    onClose: () => {
      composer.reset();
      onOpenChange(false);
    },
    blockClose: composer.sending,
  });

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <MessageComposerFields composer={composer} notice={notice} placeholder={placeholder} />
          <DialogFooter>
            <MessageComposerActions composer={composer} onCancel={requestClose} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {guardElement}
    </>
  );
}
