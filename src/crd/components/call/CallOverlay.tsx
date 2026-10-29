import { XIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { Dialog, DialogContentRaw, DialogOverlay, DialogPortal, DialogTitle } from '@/crd/primitives/dialog';

type CallOverlayConfirm = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

type CallOverlayProps = {
  open: boolean;
  /** Accessible name of the overlay. */
  label: string;
  closeLabel: string;
  /** The close button or Escape; the consumer decides whether to confirm first. */
  onRequestClose: () => void;
  /** Shown above the overlay when closing needs a confirmation. */
  confirm?: CallOverlayConfirm;
  /** The call UI itself. */
  children: ReactNode;
};

/**
 * The surface a call lives in, above everything else: the full viewport on
 * small screens, a large centred window over a dimmed backdrop on wider ones.
 * A click on the backdrop does nothing — leaving a call is never an accident.
 */
export function CallOverlay({ open, label, closeLabel, onRequestClose, confirm, children }: CallOverlayProps) {
  return (
    <>
      <Dialog
        open={open}
        onOpenChange={next => {
          if (!next) {
            onRequestClose();
          }
        }}
      >
        <DialogPortal>
          <DialogOverlay className="z-[80]" />
          <DialogContentRaw
            aria-describedby={undefined}
            data-testid="call-overlay"
            onInteractOutside={event => event.preventDefault()}
            className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-background md:inset-auto md:top-1/2 md:left-1/2 md:h-[90vh] md:w-[90vw] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-lg md:border md:border-border md:shadow-lg"
          >
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-3">
              <DialogTitle className="text-body-emphasis">{label}</DialogTitle>
              <button
                type="button"
                aria-label={closeLabel}
                onClick={onRequestClose}
                data-testid="call-overlay-close"
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <XIcon aria-hidden="true" className="size-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1">{children}</div>
          </DialogContentRaw>
        </DialogPortal>
      </Dialog>
      {confirm && (
        <ConfirmationDialog
          open={confirm.open}
          onOpenChange={next => {
            if (!next) {
              confirm.onCancel();
            }
          }}
          title={confirm.title}
          description={confirm.description}
          confirmLabel={confirm.confirmLabel}
          cancelLabel={confirm.cancelLabel}
          variant="destructive"
          onConfirm={confirm.onConfirm}
        />
      )}
    </>
  );
}
