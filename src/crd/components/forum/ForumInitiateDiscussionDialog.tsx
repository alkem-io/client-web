import { Loader2, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContentRaw, DialogOverlay, DialogPortal, DialogTitle } from '@/crd/primitives/dialog';

type ForumInitiateDiscussionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Selects the dialog title and submit-button copy; the body is identical across modes. */
  mode: 'initiate' | 'update';
  /** Translated title text — the consumer typically passes `t('dialog.create.title')` or
   *  `t('dialog.update.title')` based on `mode`. */
  title: string;
  /** Translated submit-button label. */
  submitLabel: string;
  /** Translated cancel-button label. */
  cancelLabel: string;
  /** Translated aria-label for the close (X) button — falls back to `cancelLabel`. */
  closeLabel?: string;
  /** When true, the submit button is disabled (form invalid). The form remains interactive. */
  submitDisabled: boolean;
  /** Mutation-in-flight: submit button shows a spinner and is disabled regardless of `submitDisabled`. */
  busy: boolean;
  /** Submit handler — the consumer's bridge to Formik's `submitForm()`. */
  onSubmit: () => void;
  /** Body content slot — the consumer mounts `<ForumDiscussionFormConnector ... />` here. */
  children: ReactNode;
  className?: string;
};

/**
 * Controlled Radix dialog shell used by both "Initiate Discussion" and
 * "Edit Discussion" flows. CRD-layer per Constitution: knows nothing about
 * Formik, GraphQL, or routing — the consumer wires those into `children`
 * and `onSubmit`. `mode` only chooses copy (title + submit label come from
 * the consumer); behaviour is identical across modes.
 */
export function ForumInitiateDiscussionDialog({
  open,
  onOpenChange,
  // mode is retained as a typed discriminator even though all visible
  // copy comes from explicit `title`/`submitLabel` props — it lets the
  // consumer reason about which translation set to pass, and lets analytics
  // / future variants key off the prop without breaking the API.
  mode: _mode,
  title,
  submitLabel,
  cancelLabel,
  closeLabel,
  submitDisabled,
  busy,
  onSubmit,
  children,
  className,
}: ForumInitiateDiscussionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContentRaw
          className={cn(
            'fixed top-[50%] left-[50%] z-50 flex w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border-0 bg-background shadow-2xl sm:max-w-4xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200',
            'max-h-[90vh] gap-0 p-0',
            className
          )}
        >
          {/* Sticky header */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background/95 px-6 py-4 backdrop-blur-sm">
            <DialogTitle className="text-subsection-title">{title}</DialogTitle>
            <button
              type="button"
              aria-label={closeLabel ?? cancelLabel}
              aria-disabled={busy}
              disabled={busy}
              onClick={() => {
                if (busy) return;
                onOpenChange(false);
              }}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                busy ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-muted hover:text-foreground'
              )}
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 space-y-6 overflow-y-auto p-6">{children}</div>

          {/* Sticky footer */}
          <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t bg-muted/10 px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
              {cancelLabel}
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              aria-busy={busy}
              disabled={busy || submitDisabled}
              className="text-control font-medium"
            >
              {busy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
              {submitLabel}
            </Button>
          </div>
        </DialogContentRaw>
      </DialogPortal>
    </Dialog>
  );
}
