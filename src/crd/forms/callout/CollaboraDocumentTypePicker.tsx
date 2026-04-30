import { FileText, Presentation, Sheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

export type CollaboraDocumentTypeValue = 'WORDPROCESSING' | 'SPREADSHEET' | 'PRESENTATION';

type CollaboraDocumentTypePickerProps = {
  value: CollaboraDocumentTypeValue;
  onChange: (value: CollaboraDocumentTypeValue) => void;
  className?: string;
};

const options: Array<{
  value: CollaboraDocumentTypeValue;
  labelKey: 'callout.documentText' | 'callout.documentSpreadsheet' | 'callout.documentPresentation';
  Icon: typeof FileText;
}> = [
  { value: 'WORDPROCESSING', labelKey: 'callout.documentText', Icon: FileText },
  { value: 'SPREADSHEET', labelKey: 'callout.documentSpreadsheet', Icon: Sheet },
  { value: 'PRESENTATION', labelKey: 'callout.documentPresentation', Icon: Presentation },
];

export function CollaboraDocumentTypePicker({ value, onChange, className }: CollaboraDocumentTypePickerProps) {
  const { t } = useTranslation('crd-space');

  return (
    <div className={cn('rounded-xl border border-border bg-muted/30 p-4 space-y-3 animate-in fade-in', className)}>
      <p className="text-body-emphasis text-foreground">{t('callout.createNew')}</p>
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        role="radiogroup"
        aria-label={t('callout.documentTypeLabel')}
      >
        {options.map(option => {
          const active = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                'group flex flex-col items-center justify-center gap-2 p-6 rounded-lg border bg-background text-caption transition-all cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2',
                active
                  ? 'border-primary ring-1 ring-primary/30 bg-primary/5 text-foreground'
                  : 'border-border hover:border-foreground/20 hover:bg-muted text-muted-foreground'
              )}
            >
              <input
                type="radio"
                name="collabora-document-type"
                value={option.value}
                checked={active}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <option.Icon
                className={cn('w-7 h-7', active ? 'text-primary' : 'text-muted-foreground/70')}
                aria-hidden="true"
              />
              <span className={cn('text-body-emphasis', active ? 'text-foreground' : 'text-foreground/90')}>
                {t(option.labelKey)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
