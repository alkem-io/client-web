import { useState } from 'react';

export type CollaboraRecoveryKind = 'reconnect' | 'reload';

export type CollaboraRecovery = {
  /** Request a recovery. Gated by a warning when `changesAtRisk`; performed immediately otherwise. */
  request: (kind: CollaboraRecoveryKind) => void;
  /** The action awaiting confirmation, or `null` when no warning is showing. */
  pending: CollaboraRecoveryKind | null;
  /** Which action the (action-specific) warning describes; falls back to `reconnect` while idle/closing. */
  kind: CollaboraRecoveryKind;
  /** Confirm the pending action (from the warning dialog). */
  confirm: () => void;
  /** Dismiss the warning without acting. */
  cancel: () => void;
};

/**
 * Orchestrates user-initiated recovery (Reconnect / Reload) and its pre-recovery warning.
 *
 * Both actions replace the retained editor, so when unsaved work is at risk recovery MUST be
 * confirmed first (FR-006); otherwise it runs immediately. The warning is **action-specific** —
 * the caller reads `kind` to pick the right copy for Reconnect (in-place reopen) vs Reload
 * (full page reload). `perform` is injected: this hook does not know *how* to reconnect or
 * reload, only *when* to — which keeps it pure orchestration and trivially testable.
 */
export function useCollaboraRecovery(
  changesAtRisk: boolean,
  perform: (kind: CollaboraRecoveryKind) => void
): CollaboraRecovery {
  const [pending, setPending] = useState<CollaboraRecoveryKind | null>(null);

  const request = (kind: CollaboraRecoveryKind) => {
    if (changesAtRisk) {
      setPending(kind);
    } else {
      perform(kind);
    }
  };

  const confirm = () => {
    if (pending) perform(pending);
    setPending(null);
  };

  const cancel = () => setPending(null);

  // Keep the last real action for the dialog's close animation, after `pending` clears.
  return { request, pending, kind: pending ?? 'reconnect', confirm, cancel };
}
