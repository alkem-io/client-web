import { ChevronRight, Settings, X } from 'lucide-react';
import { type ReactNode, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmojiInsertButton } from '@/crd/components/common/EmojiInsertButton';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/crd/primitives/dialog';
import { Separator } from '@/crd/primitives/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

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
  /**
   * Title input. `maxLength` turns on the character counter: it appears once the
   * value reaches `counterThreshold` and, past `maxLength`, the input goes into
   * an error state without waiting for a submit. The consumer's own submit-time
   * validation still produces `error`, which wins over the live length message.
   */
  title: {
    value: string;
    onChange: (v: string) => void;
    error?: string;
    maxLength?: number;
    counterThreshold?: number;
  };
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
  /**
   * False while the title is empty. The footer buttons are then only *visually*
   * dimmed and carry a tooltip / `aria-describedby` hint, but stay fully
   * operable — clicking still runs the consumer's validation, which surfaces the
   * title error and focuses the field. They are deliberately not `aria-disabled`
   * (that would announce an operable control as disabled to assistive tech).
   */
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
  const titleInputRef = useRef<HTMLInputElement>(null);
  const titleHintId = useId();

  const isCreate = mode === 'create';
  const headerTitle = isCreate ? t('forms.createPost') : t('forms.editPost');
  const primaryLabel = submitLabel ?? (isCreate ? t('forms.publish') : t('forms.save'));
  const blockedByTitle = !submitting && !canSubmit;

  const { maxLength: titleMaxLength, counterThreshold } = title;
  const titleLength = title.value.length;
  const titleOverLimit = titleMaxLength !== undefined && titleLength > titleMaxLength;
  const showTitleCounter = titleMaxLength !== undefined && titleLength >= (counterThreshold ?? titleMaxLength);
  // Submit-time errors from the consumer win; the live length message only fills
  // the gap before the user has tried to submit.
  const titleError = title.error ?? (titleOverLimit ? t('validation.maxSmall', { count: titleMaxLength }) : undefined);

  // While the title is missing the button is only *visually* disabled: the click
  // still reaches the consumer, whose validation sets `title.error`.
  const runAction = (action: () => void) => () => {
    action();
    if (blockedByTitle) titleInputRef.current?.focus();
  };

  const actionButton = (node: ReactNode) =>
    blockedByTitle ? (
      <Tooltip>
        <TooltipTrigger asChild={true}>{node}</TooltipTrigger>
        <TooltipContent>{t('forms.titleRequiredHint')}</TooltipContent>
      </Tooltip>
    ) : (
      node
    );

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
            <div className="flex items-center gap-2">
              <input
                ref={titleInputRef}
                id="add-post-title"
                type="text"
                placeholder={t('forms.titlePlaceholder')}
                value={title.value}
                onChange={e => title.onChange(e.target.value)}
                disabled={submitting}
                autoFocus={true}
                className={cn(
                  'flex-1 min-w-0 text-section-title md:text-page-title border-none px-0 bg-transparent focus:outline-none placeholder:text-muted-foreground/60 disabled:opacity-60',
                  titleError && 'text-destructive'
                )}
                aria-label={t('forms.titleLabel')}
                aria-invalid={!!titleError}
                aria-describedby={titleError ? 'add-post-title-error' : undefined}
              />
              <EmojiInsertButton
                inputRef={titleInputRef}
                value={title.value}
                onChange={title.onChange}
                ariaLabel={t('forms.insertEmoji')}
                disabled={submitting}
              />
            </div>
            {(titleError || showTitleCounter) && (
              <div className="flex items-start justify-between gap-4">
                {titleError ? (
                  <p id="add-post-title-error" className="text-caption text-destructive" aria-live="polite">
                    {titleError}
                  </p>
                ) : (
                  <span />
                )}
                {showTitleCounter && (
                  <output
                    htmlFor="add-post-title"
                    aria-live="polite"
                    className={cn(
                      'shrink-0 text-caption tabular-nums',
                      titleOverLimit ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    {t('forms.titleCharacterCount', { current: titleLength, max: titleMaxLength })}
                  </output>
                )}
              </div>
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
          {blockedByTitle && (
            <span id={titleHintId} className="sr-only">
              {t('forms.titleRequiredHint')}
            </span>
          )}
          <div className="ml-auto flex items-center gap-3">
            {isCreate && notifySwitchSlot}
            {isCreate ? (
              <>
                {onSaveDraft &&
                  actionButton(
                    <Button
                      variant="ghost"
                      onClick={runAction(onSaveDraft)}
                      disabled={submitting}
                      aria-describedby={blockedByTitle ? titleHintId : undefined}
                      aria-busy={submitting}
                      className={cn(blockedByTitle && 'opacity-50')}
                    >
                      {t('forms.saveDraft')}
                    </Button>
                  )}
                {actionButton(
                  <Button
                    onClick={runAction(onSubmit)}
                    className={cn('px-8', blockedByTitle && 'opacity-50')}
                    disabled={submitting}
                    aria-describedby={blockedByTitle ? titleHintId : undefined}
                    aria-busy={submitting}
                  >
                    {primaryLabel}
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
                  {t('dialogs.cancel')}
                </Button>
                {actionButton(
                  <Button
                    onClick={runAction(onSubmit)}
                    className={cn('px-8', blockedByTitle && 'opacity-50')}
                    disabled={submitting}
                    aria-describedby={blockedByTitle ? titleHintId : undefined}
                    aria-busy={submitting}
                  >
                    {primaryLabel}
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
