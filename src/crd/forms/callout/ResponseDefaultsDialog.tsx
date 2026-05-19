import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DiscardChangesDialog } from '@/crd/components/dialogs/DiscardChangesDialog';
import type { ContributionDefaults, ResponseType } from '@/crd/forms/callout/types';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/crd/primitives/dialog';
import { Label } from '@/crd/primitives/label';

/**
 * Helper handed to the render-prop form of `templateSlot` (D20, 2026-05-19). Calling it merges a
 * partial into the dialog's own `draft` state — so a connector applying a picked template's values
 * populates the dialog's input fields immediately, the user can review / further edit them, the
 * dialog's Save commits the final draft, and Cancel correctly discards the templated values.
 * Replaces the older "connector writes via parent `onSave` → sync effect into draft" loop, which
 * (a) didn't populate `defaultDescription` because no sync effect existed for that field, and (b)
 * leaked the templated value to the parent even when the user cancelled.
 *
 * Scope: this is the **`post`** apply path. **Whiteboard** content is *not* applied through this
 * helper — `whiteboardContent` is sourced from the parent `values` (see `handleSave` / the dirty
 * check / the `values.whiteboardContent` sync effect), so the connector applies a whiteboard
 * template through the parent `onSave` instead, matching the whiteboard-editor sub-flow.
 */
type ApplyDraft = (next: Partial<ContributionDefaults>) => void;

type ResponseDefaultsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Active response type. Determines which fields render. Only `post`, `memo`,
   * and `whiteboard` have real defaults; `document` shows a placeholder;
   * `link` / `none` should not open this dialog.
   */
  type: ResponseType;
  /** Parent-form value — used as the initial draft state each time the dialog opens. */
  values: ContributionDefaults;
  /** Commits draft values back to the parent form. */
  onSave: (next: ContributionDefaults) => void;
  /**
   * Optional template-picker entry-point slot — rendered for `post` and `whiteboard` types.
   * **Render-prop form (D20)**: when given a function, the dialog passes `{ applyDraft }` so the
   * connector can push the picked template's values straight into the dialog's draft state
   * (rather than going through the parent — see `ApplyDraft` above). `ReactNode` form is still
   * accepted for callers that don't need draft access.
   */
  templateSlot?: ReactNode | ((helpers: { applyDraft: ApplyDraft }) => ReactNode);
  /**
   * Optional whiteboard-editor launcher slot — rendered for the whiteboard
   * type (the connector wires `CrdSingleUserWhiteboardDialog`).
   */
  whiteboardSlot?: ReactNode;
  disabled?: boolean;
};

/**
 * Nested "{Type} defaults" dialog shown when the user clicks "Set Default
 * Response" in `ResponsePanel`. Holds its own transient draft state; Save
 * commits it back to the parent form (spec FR-40..FR-46, plan D5).
 */
export function ResponseDefaultsDialog({
  open,
  onOpenChange,
  type,
  values,
  onSave,
  templateSlot,
  whiteboardSlot,
  disabled,
}: ResponseDefaultsDialogProps) {
  const { t } = useTranslation('crd-space');
  const [draft, setDraft] = useState<ContributionDefaults>(values);
  // Snapshot of `values` at open-time — drives the dirty check that gates the
  // "Discard changes?" confirmation on close. Re-seeded on every open so each
  // dialog session starts clean.
  const [openSnapshot, setOpenSnapshot] = useState<ContributionDefaults>(values);
  const [discardOpen, setDiscardOpen] = useState(false);

  // Seed the draft only on the closed → open transition. A parent re-render
  // that hands a new `values` reference (unrelated form mutation, identity
  // change) would otherwise clobber the user's in-flight draft. The ref keeps
  // `values` out of the effect deps without disabling exhaustive-deps.
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft(valuesRef.current);
      setOpenSnapshot(valuesRef.current);
    }
    wasOpenRef.current = open;
  }, [open]);

  // Sync `whiteboardContent` from parent values into draft whenever it changes
  // while the dialog is open. The whiteboard sub-flow commits via the parent's
  // `onSave` (writing straight to the form), bypassing this dialog's draft —
  // without this sync, the outer Save would commit a stale empty
  // `whiteboardContent` and wipe the inner dialog's save.
  useEffect(() => {
    if (open) {
      setDraft(prev =>
        prev.whiteboardContent === values.whiteboardContent
          ? prev
          : { ...prev, whiteboardContent: values.whiteboardContent }
      );
    }
  }, [open, values.whiteboardContent]);

  // Dirty against the open-time snapshot rather than against `values` —
  // `values` may have been mutated via the whiteboard sub-flow (which commits
  // through the parent form) and is intended to be preserved on Save. The
  // snapshot is the only stable "what did the user start with" reference.
  const isDirty =
    draft.defaultDisplayName !== openSnapshot.defaultDisplayName ||
    draft.postDescription !== openSnapshot.postDescription ||
    values.whiteboardContent !== openSnapshot.whiteboardContent;

  const handleRequestClose = () => {
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }
    onOpenChange(false);
  };

  const handleConfirmDiscard = () => {
    setDiscardOpen(false);
    onOpenChange(false);
  };

  const title = (() => {
    switch (type) {
      case 'post':
        return t('responseDefaults.title.post');
      case 'memo':
        return t('responseDefaults.title.memo');
      case 'whiteboard':
        return t('responseDefaults.title.whiteboard');
      default:
        return t('responseDefaults.title.generic');
    }
  })();

  const handleSave = () => {
    // The whiteboard editor commits its content directly to the parent form
    // (via the connector's `onSave` from `whiteboardSlot`), so by the time the
    // user clicks Save here, `values.whiteboardContent` already holds the
    // freshly-configured whiteboard. The local `draft` was seeded at open time
    // and still has the stale value — committing it would wipe the inner
    // dialog's save. Merge the up-to-date whiteboard content from `values`.
    onSave({ ...draft, whiteboardContent: values.whiteboardContent });
    onOpenChange(false);
  };

  // D20 — `applyDraft` is the helper the connector receives via the render-prop `templateSlot`.
  // It merges a partial into the dialog's local `draft` (not the parent). Resolved each render —
  // React Compiler keeps the inline closure stable enough for the consumer's effect dependency.
  const applyDraft: ApplyDraft = next => setDraft(prev => ({ ...prev, ...next }));
  const renderedTemplateSlot =
    typeof templateSlot === 'function'
      ? (templateSlot as (helpers: { applyDraft: ApplyDraft }) => ReactNode)({ applyDraft })
      : templateSlot;

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          handleRequestClose();
        } else {
          onOpenChange(true);
        }
      }}
    >
      {/* Sticky-header + sticky-footer + scrollable-body layout (D20, 2026-05-19) — mirrors
          `TemplateFormDialog` / `TemplatePreviewDialog`. Wider than the default `sm:max-w-2xl` so
          the markdown editor + template-picker button row don't crowd at typical viewport widths. */}
      <DialogContent className="w-full sm:max-w-[720px] max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
        <div className="px-6 pt-6 pb-4 pr-12 border-b">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{t('responseDefaults.srDescription')}</DialogDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-w-0">
          {(type === 'post' || type === 'whiteboard') && renderedTemplateSlot}

          <div className="space-y-1.5">
            <Label htmlFor="response-defaults-display-name" className="text-body text-foreground">
              {t('responseDefaults.defaultTitle')}
            </Label>
            <input
              id="response-defaults-display-name"
              type="text"
              value={draft.defaultDisplayName}
              onChange={e => setDraft(prev => ({ ...prev, defaultDisplayName: e.target.value }))}
              placeholder={t('responseDefaults.defaultTitlePlaceholder')}
              disabled={disabled}
              className="w-full h-9 px-3 border border-border rounded-md bg-background text-control focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </div>

          {(type === 'post' || type === 'memo') && (
            <div className="space-y-1.5">
              <Label className="text-body text-foreground">{t('responseDefaults.defaultDescription')}</Label>
              <MarkdownEditor
                value={draft.postDescription}
                onChange={value => setDraft(prev => ({ ...prev, postDescription: value }))}
                disabled={disabled}
                placeholder={t('responseDefaults.defaultDescriptionPlaceholder')}
              />
            </div>
          )}

          {type === 'whiteboard' && (
            <div className="space-y-1.5">
              <Label className="text-body text-foreground">{t('responseDefaults.defaultWhiteboard')}</Label>
              {whiteboardSlot}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="ghost" onClick={handleRequestClose} disabled={disabled}>
            {t('dialogs.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={disabled}>
            {t('responseDefaults.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
      <DiscardChangesDialog open={discardOpen} onOpenChange={setDiscardOpen} onConfirm={handleConfirmDiscard} />
    </Dialog>
  );
}
