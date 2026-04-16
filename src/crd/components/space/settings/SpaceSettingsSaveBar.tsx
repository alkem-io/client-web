import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

/**
 * SaveBarState mirrors the contract in specs/045-crd-space-settings/contracts/shell.ts.
 * Used ONLY by the Layout tab — About uses per-field autosave (FR-005a).
 */
export type SaveBarState =
  | { kind: 'clean' }
  | { kind: 'dirty'; canSave: boolean }
  | { kind: 'saving' }
  | { kind: 'saveError'; message: string };

type SpaceSettingsSaveBarProps = {
  state: SaveBarState;
  onSave: () => void;
  onReset: () => void;
  saveLabel: string;
  resetLabel: string;
  savingLabel: string;
  savedLabel?: string;
  className?: string;
};

/**
 * Sticky Save Changes / Reset action bar (Layout tab only).
 *
 * Hidden when `state.kind === 'clean'`. While `state.kind === 'saving'`, both
 * buttons are disabled. On `state.kind === 'saveError'`, both buttons are
 * re-enabled and the error message renders inline (FR-008 save-error retry).
 */
export function SpaceSettingsSaveBar({
  state,
  onSave,
  onReset,
  saveLabel,
  resetLabel,
  savingLabel,
  className,
}: SpaceSettingsSaveBarProps) {
  if (state.kind === 'clean') {
    return null;
  }

  const saving = state.kind === 'saving';
  const isError = state.kind === 'saveError';
  const canSave = state.kind === 'dirty' ? state.canSave : !saving;

  return (
    <section
      aria-live="polite"
      className={cn(
        'fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-lg',
        className
      )}
    >
      {saving ? (
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          {savingLabel}
        </span>
      ) : null}
      {isError ? (
        <span className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle aria-hidden="true" className="size-4" />
          {state.message}
        </span>
      ) : null}
      {state.kind === 'dirty' ? (
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 aria-hidden="true" className="size-4" />
        </span>
      ) : null}
      <Button type="button" variant="ghost" onClick={onReset} disabled={saving}>
        {resetLabel}
      </Button>
      <Button type="button" onClick={onSave} disabled={!canSave || saving}>
        {saveLabel}
      </Button>
    </section>
  );
}
