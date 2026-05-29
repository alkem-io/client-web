import { Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';

export type InlineSectionSaveStatus = 'idle' | 'saving' | 'saved';

export type InlineSectionSaveProps = {
  dirty: boolean;
  status: InlineSectionSaveStatus;
  onSave: () => void;
  /** Optional inline error message (resolved by the consumer via i18n). */
  error?: string;
};

export const InlineSectionSave = ({ dirty, status, onSave, error }: InlineSectionSaveProps) => {
  const { t } = useTranslation('crd-innovationHub');

  if (error) {
    return (
      <p role="alert" className="text-caption text-destructive">
        {error}
      </p>
    );
  }

  if (status === 'saved') {
    return (
      <span
        aria-live="polite"
        className="text-caption inline-flex items-center gap-1 text-emerald-600 animate-in fade-in slide-in-from-left-1 duration-200"
      >
        <Check aria-hidden="true" className="size-3" /> {t('settings.about.save.saved')}
      </span>
    );
  }

  if (status === 'saving') {
    return (
      <span aria-live="polite" className="text-caption inline-flex items-center gap-1 text-muted-foreground">
        <Loader2 aria-hidden="true" className="size-3 animate-spin" /> {t('settings.about.save.saving')}
      </span>
    );
  }

  if (!dirty) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onSave}
      className="text-caption h-6 px-2 text-primary hover:bg-primary/10 hover:text-primary animate-in fade-in slide-in-from-left-1 duration-200"
    >
      {t('settings.about.save.save')}
    </Button>
  );
};
