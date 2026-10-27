import { AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

/**
 * State of the tab-wide unsaved-changes bar (spec 045 FR-025 – FR-025d, spec 097 Session 2026-10-22).
 * `count` is the number of changed fields on the active tab (FR-025b).
 */
export type UnsavedChangesBarState =
  | { kind: 'clean' }
  | { kind: 'dirty'; count: number; canSave: boolean }
  | { kind: 'saving'; count: number }
  /** `canSave` gates the retry: an edit made after the failure can still be invalid. */
  | { kind: 'saveError'; count: number; message: string; canSave: boolean };

type UnsavedChangesBarProps = {
  state: UnsavedChangesBarState;
  onSave: () => void;
  /** Opens the consumer-owned Discard confirmation — the bar never resets anything itself. */
  onDiscard: () => void;
};

/**
 * Bar fixed to the bottom of the viewport while the active settings tab has
 * unsaved changes: the count on the left, Discard + Save changes on the right.
 * Mirrors the prototype's `SaveBar`, aligned to the settings page's content column.
 */
export function UnsavedChangesBar({ state, onSave, onDiscard }: UnsavedChangesBarProps) {
  const { t } = useTranslation('crd-common');
  const visible = state.kind !== 'clean';
  // Keep showing the last count while the bar slides out, instead of flashing "0 unsaved changes".
  const [shownCount, setShownCount] = useState(0);
  if (visible && state.count !== shownCount) setShownCount(state.count);
  const count = visible ? state.count : shownCount;
  const saving = state.kind === 'saving';
  const canSave = (state.kind === 'dirty' || state.kind === 'saveError') && state.canSave;

  return (
    <section
      aria-label={t('unsavedChanges.regionLabel')}
      aria-hidden={!visible}
      inert={!visible}
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t border-primary/35 bg-primary/[0.09] backdrop-blur-sm transition-all duration-300',
        visible
          ? 'translate-y-0 opacity-100 shadow-[0_-4px_16px_rgba(0,0,0,0.10)]'
          : 'pointer-events-none translate-y-full opacity-0'
      )}
    >
      <div className="px-6 py-3 md:px-8">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 flex flex-wrap items-center justify-between gap-3 lg:col-span-10 lg:col-start-2">
            <div aria-live="polite" className="flex min-w-0 items-center gap-2">
              {saving ? (
                <>
                  <Loader2 aria-hidden="true" className="size-4 animate-spin text-primary" />
                  <p className="text-body text-foreground/70">{t('unsavedChanges.saving')}</p>
                </>
              ) : (
                <>
                  <span
                    aria-hidden="true"
                    className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-badge text-primary-foreground"
                  >
                    {count}
                  </span>
                  <p className="text-body text-foreground/70">{t('unsavedChanges.count', { count })}</p>
                </>
              )}
              {state.kind === 'saveError' && (
                <p role="alert" className="flex items-center gap-1.5 text-body text-destructive">
                  <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
                  {state.message}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="sm" onClick={onDiscard} disabled={saving}>
                {t('unsavedChanges.discard')}
              </Button>
              <Button
                type="button"
                onClick={onSave}
                disabled={!canSave || saving}
                aria-busy={saving}
                className="min-w-[120px] shadow-md transition-shadow hover:shadow-lg"
              >
                {saving && <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" />}
                {t('unsavedChanges.save')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
