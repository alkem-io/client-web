import { ChevronRight, Settings, X } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/crd/primitives/dialog';
import { Separator } from '@/crd/primitives/separator';

export type AddPostModalMode = 'create' | 'edit';

export type AddPostModalProps = {
  open: boolean;
  /**
   * Called when Radix requests a close (X, Escape, outside click). The consumer
   * is responsible for gating on `dirty` and showing a confirmation; this
   * component never imports lodash / diffs state (plan D21).
   */
  onOpenChange: (open: boolean) => void;
  mode: AddPostModalMode;
  /**
   * Whether the form has pending changes. Only used to decide whether
   * `onOpenChange(false)` should trigger a discard confirmation — the modal
   * itself never renders the confirmation (the consumer does, via `dirty` + a
   * `DiscardChangesDialog`). The modal simply calls `onOpenChange(false)` and
   * lets the connector branch.
   */
  dirty?: boolean;
  /** True while a create / update mutation is in flight. Footer buttons go busy. */
  submitting?: boolean;
  // Title input
  title: { value: string; onChange: (v: string) => void; error?: string };
  // Slots
  descriptionSlot?: ReactNode;
  framingZoneSlot?: ReactNode;
  responsesZoneSlot?: ReactNode;
  moreOptionsSlot?: ReactNode;
  notifySwitchSlot?: ReactNode;
  // Actions
  onSubmit: () => void;
  onSaveDraft?: () => void;
  onFindTemplate?: () => void;
  submitLabel?: string;
  /** Publish / Save button is disabled until the title is non-empty. */
  canSubmit?: boolean;
  className?: string;
};

export function AddPostModal({
  open,
  onOpenChange,
  mode,
  dirty: _dirty,
  submitting = false,
  title,
  descriptionSlot,
  framingZoneSlot,
  responsesZoneSlot,
  moreOptionsSlot,
  notifySwitchSlot,
  onSubmit,
  onSaveDraft,
  onFindTemplate,
  submitLabel,
  canSubmit = true,
  className,
}: AddPostModalProps) {
  const { t } = useTranslation('crd-space');
  const [moreOpen, setMoreOpen] = useState(false);

  const isCreate = mode === 'create';
  const headerTitle = isCreate ? t('forms.createPost') : t('forms.editPost');
  const primaryLabel = submitLabel ?? (isCreate ? t('forms.publish') : t('forms.save'));
  const primaryDisabled = submitting || !canSubmit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'w-full sm:max-w-5xl p-0 gap-0 overflow-hidden rounded-xl border-0 shadow-2xl bg-background flex flex-col max-h-[90vh]',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background/50 backdrop-blur-sm z-10">
          <DialogTitle className="text-subsection-title">{headerTitle}</DialogTitle>
          <div className="flex items-center gap-2">
            {isCreate && onFindTemplate && (
              <Button variant="outline" size="sm" onClick={onFindTemplate} disabled={submitting}>
                {t('forms.findTemplate')}
              </Button>
            )}
            <button
              type="button"
              className="rounded-full p-2 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={t('contribution.close')}
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            </button>
          </div>
        </div>
        <DialogDescription className="sr-only">{t('forms.descriptionPlaceholder')}</DialogDescription>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <input
              type="text"
              placeholder={t('forms.titlePlaceholder')}
              value={title.value}
              onChange={e => title.onChange(e.target.value)}
              disabled={submitting}
              autoFocus={true}
              className={cn(
                'w-full text-section-title md:text-page-title border-none px-0 bg-transparent focus:outline-none placeholder:text-muted-foreground/60 disabled:opacity-60',
                title.error && 'text-destructive'
              )}
              aria-label={t('forms.titleLabel')}
              aria-invalid={!!title.error}
              aria-describedby={title.error ? 'add-post-title-error' : undefined}
            />
            {title.error && (
              <p id="add-post-title-error" className="text-caption text-destructive" aria-live="polite">
                {title.error}
              </p>
            )}
          </div>

          {/* Description */}
          {descriptionSlot}

          {/* Zone 1: framing chip strip + active framing editor */}
          {framingZoneSlot}

          {/* Zone 2: responses chip strip + active response panel */}
          {responsesZoneSlot && (
            <>
              <Separator />
              {responsesZoneSlot}
            </>
          )}

          {/* Zone 3: more options (collapsible) */}
          {moreOptionsSlot && (
            <>
              <Separator />
              <div className="space-y-2">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => setMoreOpen(v => !v)}
                  aria-expanded={moreOpen}
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Settings className="w-4 h-4" aria-hidden="true" />
                    <span className="text-body">{t('forms.moreOptions')}</span>
                  </div>
                  <ChevronRight
                    className={cn('w-4 h-4 text-muted-foreground transition-transform', moreOpen && 'rotate-90')}
                    aria-hidden="true"
                  />
                </button>
                {moreOpen && <div className="space-y-4 pt-2 px-2">{moreOptionsSlot}</div>}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/10 flex items-center">
          <div className="ml-auto flex items-center gap-3">
            {isCreate && notifySwitchSlot}
            {isCreate ? (
              <>
                {onSaveDraft && (
                  <Button variant="ghost" onClick={onSaveDraft} disabled={primaryDisabled} aria-busy={submitting}>
                    {t('forms.saveDraft')}
                  </Button>
                )}
                <Button onClick={onSubmit} className="px-8" disabled={primaryDisabled} aria-busy={submitting}>
                  {primaryLabel}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
                  {t('dialogs.cancel')}
                </Button>
                <Button onClick={onSubmit} className="px-8" disabled={primaryDisabled} aria-busy={submitting}>
                  {primaryLabel}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
