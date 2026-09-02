import { type ReactElement, useState } from 'react';
import { DiscardChangesDialog } from './DiscardChangesDialog';

type DialogCloseGuardOptions = {
  /** True when the dialog holds unsaved, user-authored input. */
  isDirty: boolean;
  /**
   * Performs the actual close — typically `() => onOpenChange(false)` (and any
   * `onCancel()` the dialog needs). Only called once the close is allowed (the
   * dialog is clean, or the user confirmed "Discard").
   */
  onClose: () => void;
  /**
   * When true, every close attempt is ignored (no close, no prompt). Use for a
   * submit/mutation in flight — mirrors the existing "can't close while
   * submitting" behaviour several dialogs already had.
   */
  blockClose?: boolean;
};

type DialogCloseGuard = {
  /**
   * Wire to the dialog primitive's `onOpenChange`. Radix routes Esc, overlay
   * click, and the X button all through `onOpenChange(false)`, so guarding this
   * one callback covers every close affordance.
   */
  handleOpenChange: (open: boolean) => void;
  /** Imperative close-with-guard for footer "Cancel"/"Close" buttons. */
  requestClose: () => void;
  /** Render once inside the dialog component (sibling of the `<Dialog>`). */
  guardElement: ReactElement;
};

/**
 * DRY discard-on-close guard for every CRD dialog.
 *
 * The single place that implements "if the dialog is dirty, intercept the close
 * and confirm via {@link DiscardChangesDialog} before losing the user's input".
 * Dialogs only supply *what* dirty means (a boolean) and *how* to close — the
 * Esc / overlay-click / X-button interception and the confirmation flow live
 * here so no dialog re-implements it.
 */
export function useDialogCloseGuard({ isDirty, onClose, blockClose }: DialogCloseGuardOptions): DialogCloseGuard {
  const [discardOpen, setDiscardOpen] = useState(false);

  const requestClose = () => {
    if (blockClose) return;
    if (isDirty) {
      setDiscardOpen(true);
    } else {
      onClose();
    }
  };

  // Only the close transition is guarded; opening is owned by the parent's
  // `open` prop (these dialogs are controlled, not trigger-driven).
  const handleOpenChange = (open: boolean) => {
    if (!open) requestClose();
  };

  const guardElement = (
    <DiscardChangesDialog
      open={discardOpen}
      onOpenChange={setDiscardOpen}
      onConfirm={() => {
        setDiscardOpen(false);
        onClose();
      }}
      onCancel={() => setDiscardOpen(false)}
    />
  );

  return { handleOpenChange, requestClose, guardElement };
}
