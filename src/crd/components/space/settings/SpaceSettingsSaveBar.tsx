import { AlertCircle, Loader2, Save, Undo2 } from 'lucide-react';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

/**
 * SaveBarState mirrors the contract in specs/045-crd-space-settings/contracts/shell.ts.
 * Used ONLY by the Layout tab — About uses per-section inline Save buttons (FR-005a).
 */
export type SaveBarState =
  | { kind: 'clean' }
  | { kind: 'dirty'; canSave: boolean }
  | { kind: 'saving' }
  | { kind: 'saveError'; message: string };

type SpaceSettingsSaveBarProps = {
  state: SaveBarState;
  onSave: () => void;
  onDiscard: () => void;
  saveLabel: string;
  discardLabel: string;
  savingLabel: string;
  className?: string;
};

/**
 * Save Changes / Discard Changes action row for the Layout tab.
 *
 * The Discard button is wired to a consumer-owned confirmation dialog — the
 * view never reverts state directly.
 */
export function SpaceSettingsSaveBar({
  state,
  onSave,
  onDiscard,
  saveLabel,
  discardLabel,
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
        onClick={onDiscard}
        disabled={saving || isClean}
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      >
        <Undo2 aria-hidden="true" className="mr-1.5 size-4" />
        {discardLabel}
      </Button>
      <Button type="button" onClick={onSave} disabled={!canSave || saving}>
        <Save aria-hidden="true" className="mr-1.5 size-4" />
        {saveLabel}
      </Button>
    </section>
  );
}
