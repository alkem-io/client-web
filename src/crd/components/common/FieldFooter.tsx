import { Check, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';

/**
 * Per-section save status. Matches 045 About's section state shape.
 *
 * - `idle`: nothing to show.
 * - `saving`: mutation in flight; render a spinner + label.
 * - `saved`: success flash. The integration hook auto-transitions back to
 *   `idle` after `SAVED_FLASH_MS` (1800).
 * - `error`: render a Retry button that calls `onSave`.
 */
export type SectionSaveStatus =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; at?: number }
  | { kind: 'error'; message: string };

/** Default flash duration for the "Saved!" indicator (matches 045's value). */
export const SAVED_FLASH_MS = 1800;

export type FieldFooterLabels = {
  /** Label for the Save button shown when the section is dirty and idle. */
  save: string;
  /** Label rendered next to the spinner while saving. */
  saving: string;
  /** Label rendered next to the green check after a successful save. */
  saved: string;
  /** Label rendered on the inline retry button after a failed save. */
  retry: string;
};

export type FieldFooterProps = {
  /** Optional hint rendered on the left side of the footer row. */
  hint?: ReactNode;
  /** True when the section's draft differs from the last server-known value. */
  dirty: boolean;
  /** Per-render status from the integration hook. */
  status: SectionSaveStatus;
  /** Called on Save click (or Retry click when `status.kind === 'error'`). */
  onSave: () => void;
  /** All user-visible strings — pass via the consumer's i18n. */
  labels: FieldFooterLabels;
  className?: string;
};

/**
 * Per-section save footer — extracted from 045's
 * `SpaceSettingsAboutView.tsx` for reuse across CRD settings tabs.
 *
 * Renders an optional hint on the left and an inline save indicator on the
 * right (Save button / spinner / "Saved!" / Retry). The Save button itself is
 * only visible when the section is dirty and the status is `idle` — this
 * matches the 045 pattern. While saving, the button is replaced by a busy
 * indicator (which exposes `aria-busy="true"` per FR-150).
 *
 * Pure presentational — receives all behavior as props per
 * `src/crd/CLAUDE.md`. No i18n imports, no domain hooks, no MUI.
 */
export function FieldFooter({ hint, dirty, status, onSave, labels, className }: FieldFooterProps) {
  return (
    <div className={cn('mt-1.5 flex items-start justify-between gap-3', className)}>
      {hint ? <p className="text-caption text-muted-foreground">{hint}</p> : <span aria-hidden="true" />}
      <FieldFooterIndicator dirty={dirty} status={status} onSave={onSave} labels={labels} />
    </div>
  );
}

function FieldFooterIndicator({
  dirty,
  status,
  onSave,
  labels,
}: {
  dirty: boolean;
  status: SectionSaveStatus;
  onSave: () => void;
  labels: FieldFooterLabels;
}) {
  if (status.kind === 'saving') {
    return (
      <output
        aria-busy="true"
        aria-label={labels.saving}
        className="inline-flex items-center gap-1 text-caption text-muted-foreground"
      >
        <Loader2 aria-hidden="true" className="size-3 animate-spin" />
        {labels.saving}
      </output>
    );
  }
  if (status.kind === 'saved') {
    return (
      <output aria-live="polite" className="inline-flex items-center gap-1 text-caption text-emerald-600">
        <Check aria-hidden="true" className="size-3" />
        {labels.saved}
      </output>
    );
  }
  if (status.kind === 'error') {
    return (
      <span className="inline-flex flex-col items-end gap-0.5">
        <span role="alert" className="text-caption text-destructive">
          {status.message}
        </span>
        <button
          type="button"
          onClick={onSave}
          className="text-caption font-semibold text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {labels.retry}
        </button>
      </span>
    );
  }
  if (!dirty) return null;
  return (
    <button
      type="button"
      onClick={onSave}
      className="text-caption font-semibold text-foreground px-2 py-0.5 rounded hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {labels.save}
    </button>
  );
}
