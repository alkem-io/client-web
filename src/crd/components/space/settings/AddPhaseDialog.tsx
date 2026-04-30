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

export type AddPhaseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: { displayName: string; description: string }) => Promise<void>;
  /** Names of existing phases — submission is blocked when the name collides (case-insensitive). */
  existingPhaseNames: string[];
};

export function AddPhaseDialog({ open, onOpenChange, onSubmit, existingPhaseNames }: AddPhaseDialogProps) {
  const { t } = useTranslation('crd-spaceSettings');
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
      setError(e instanceof Error ? e.message : t('layout.addPhase.dialog.errorGeneric'));
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => (!submitting ? onOpenChange(open) : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('layout.addPhase.dialog.title')}</DialogTitle>
          <DialogDescription>{t('layout.addPhase.dialog.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phase-name">{t('layout.addPhase.dialog.nameLabel')}</Label>
            <Input
              id="phase-name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={t('layout.addPhase.dialog.namePlaceholder')}
              autoFocus={true}
              disabled={submitting}
              maxLength={80}
            />
            {collidesByName && <p className="text-caption text-destructive">{t('layout.addPhase.dialog.duplicate')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phase-description">{t('layout.addPhase.dialog.descriptionLabel')}</Label>
            <Textarea
              id="phase-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('layout.addPhase.dialog.descriptionPlaceholder')}
              rows={3}
              disabled={submitting}
              maxLength={400}
            />
          </div>
          {error && <p className="text-caption text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {t('layout.addPhase.dialog.cancel')}
          </Button>
          <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()} aria-busy={submitting}>
            {submitting && <Loader2 aria-hidden="true" className="mr-1.5 size-4 animate-spin" />}
            {t('layout.addPhase.dialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
