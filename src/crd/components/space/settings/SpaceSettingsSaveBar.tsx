import { AlertCircle, Loader2, RotateCcw } from 'lucide-react';
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
  const isClean = state.kind === 'clean';
  const saving = state.kind === 'saving';
  const isError = state.kind === 'saveError';
  const canSave = state.kind === 'dirty' ? state.canSave : !saving && !isClean;

  return (
    <section aria-live="polite" className={cn('flex items-center justify-end gap-3 pt-4', className)}>
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
      <Button
        type="button"
        variant="ghost"
        onClick={onReset}
        disabled={saving || isClean}
        className="hover:text-destructive hover:bg-destructive/10"
      >
        <RotateCcw aria-hidden="true" className="mr-1.5 size-4" />
        {resetLabel}
      </Button>
      <Button type="button" onClick={onSave} disabled={!canSave || saving}>
        {saveLabel}
      </Button>
    </section>
  );
}
