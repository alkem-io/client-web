import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Textarea } from '@/crd/primitives/textarea';

// Full literal i18n keys for the Add dialog, one set per user-facing noun. Declared as constants
// (not template-built strings) so the typed `t()` accepts them.
const ADD_PHASE_KEYS = {
  title: 'layout.addPhase.dialog.title',
  description: 'layout.addPhase.dialog.description',
  nameLabel: 'layout.addPhase.dialog.nameLabel',
  namePlaceholder: 'layout.addPhase.dialog.namePlaceholder',
  duplicate: 'layout.addPhase.dialog.duplicate',
  errorGeneric: 'layout.addPhase.dialog.errorGeneric',
  descriptionLabel: 'layout.addPhase.dialog.descriptionLabel',
  descriptionPlaceholder: 'layout.addPhase.dialog.descriptionPlaceholder',
  cancel: 'layout.addPhase.dialog.cancel',
  confirm: 'layout.addPhase.dialog.confirm',
} as const;
const ADD_TAB_KEYS = {
  title: 'layout.addTab.dialog.title',
  description: 'layout.addTab.dialog.description',
  nameLabel: 'layout.addTab.dialog.nameLabel',
  namePlaceholder: 'layout.addTab.dialog.namePlaceholder',
  duplicate: 'layout.addTab.dialog.duplicate',
  errorGeneric: 'layout.addTab.dialog.errorGeneric',
  descriptionLabel: 'layout.addTab.dialog.descriptionLabel',
  descriptionPlaceholder: 'layout.addTab.dialog.descriptionPlaceholder',
  cancel: 'layout.addTab.dialog.cancel',
  confirm: 'layout.addTab.dialog.confirm',
} as const;

export type AddPhaseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: { displayName: string; description: string }) => Promise<void>;
  /** Names of existing phases — submission is blocked when the name collides (case-insensitive). */
  existingPhaseNames: string[];
  /**
   * User-facing noun for the entity being created: 'tab' on L0 Spaces, 'phase' on subspaces.
   * Selects the localized title / labels / CTA via the `addTab.*` or `addPhase.*` key subtree.
   * Defaults to 'phase' so existing subspace callers are unchanged.
   */
  entityNoun?: 'tab' | 'phase';
};

export function AddPhaseDialog({
  open,
  onOpenChange,
  onSubmit,
  existingPhaseNames,
  entityNoun = 'phase',
}: AddPhaseDialogProps) {
  const { t } = useTranslation('crd-spaceSettings');
  // 'tab' → layout.addTab.dialog.* (L0), 'phase' → layout.addPhase.dialog.* (subspaces)
  const keys = entityNoun === 'tab' ? ADD_TAB_KEYS : ADD_PHASE_KEYS;
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setDisplayName('');
      setDescription('');
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

  const trimmed = displayName.trim();
  const collidesByName = trimmed.length > 0 && existingPhaseNames.some(n => n.toLowerCase() === trimmed.toLowerCase());
  const canSubmit = trimmed.length >= 2 && !collidesByName && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ displayName: trimmed, description: description.trim() });
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : t(keys.errorGeneric));
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => (!submitting ? onOpenChange(open) : undefined)}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>{t(keys.title)}</DialogTitle>
          <DialogDescription>{t(keys.description)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="phase-name">{t(keys.nameLabel)}</Label>
            <Input
              id="phase-name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={t(keys.namePlaceholder)}
              autoFocus={true}
              disabled={submitting}
              maxLength={80}
            />
            {collidesByName && <p className="text-caption text-destructive">{t(keys.duplicate)}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phase-description">{t(keys.descriptionLabel)}</Label>
            <Textarea
              id="phase-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t(keys.descriptionPlaceholder)}
              rows={3}
              disabled={submitting}
              maxLength={400}
            />
          </div>
          {error && <p className="text-caption text-destructive">{error}</p>}
        </div>
        <DialogFooter className="shrink-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {t(keys.cancel)}
          </Button>
          <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()} aria-busy={submitting}>
            {submitting && <Loader2 aria-hidden="true" className="mr-1.5 size-4 animate-spin" />}
            {t(keys.confirm)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
