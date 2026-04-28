import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ContributionDefaults, ResponseType } from '@/crd/forms/callout/types';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/crd/primitives/dialog';
import { Label } from '@/crd/primitives/label';

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
   * Optional template-picker popover slot — injected by the connector
   * (`ResponseDefaultsConnector` fetches `useSpaceContentTemplatesOnSpaceQuery`
   * and passes the picker). Rendered for post + whiteboard types only (FR-41).
   */
  templateSlot?: ReactNode;
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
    }
    wasOpenRef.current = open;
  }, [open]);

  const title = (() => {
    switch (type) {
      case 'post':
        return t('responseDefaults.title.post');
      case 'memo':
        return t('responseDefaults.title.memo');
      case 'whiteboard':
        return t('responseDefaults.title.whiteboard');
      case 'document':
        return t('responseDefaults.title.document');
      default:
        return t('responseDefaults.title.generic');
    }
  })();

  const handleSave = () => {
    onSave(draft);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="sr-only">{t('responseDefaults.srDescription')}</DialogDescription>

        <div className="space-y-4 min-w-0">
          {(type === 'post' || type === 'whiteboard') && templateSlot}

          {type !== 'document' && (
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
          )}

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

          {type === 'document' && (
            <p className="text-caption text-muted-foreground italic">{t('framing.comingSoon')}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={disabled}>
            {t('dialogs.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={disabled}>
            {t('responseDefaults.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
