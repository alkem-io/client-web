import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Link as LinkIcon } from 'lucide-react';

type LinkFramingFieldsProps = {
  url: string;
  onUrlChange: (value: string) => void;
  urlError?: string;
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  displayNameError?: string;
  className?: string;
};

export function LinkFramingFields({
  url,
  onUrlChange,
  urlError,
  displayName,
  onDisplayNameChange,
  displayNameError,
  className,
}: LinkFramingFieldsProps) {
  const { t } = useTranslation('crd-space');

  return (
    <div className={cn('space-y-3 p-4 border rounded-xl bg-muted/30', className)}>
      <div className="flex items-center gap-2 mb-2">
        <LinkIcon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-medium">{t('callout.link')}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{t('forms.linkUrl')}</label>
          <input
            type="url"
            value={url}
            onChange={e => onUrlChange(e.target.value)}
            placeholder="https://"
            className={cn(
              'w-full h-9 px-3 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20',
              urlError ? 'border-destructive' : 'border-border'
            )}
            aria-label={t('forms.linkUrl')}
            aria-invalid={!!urlError}
          />
          {urlError && <p className="text-xs text-destructive">{urlError}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{t('forms.linkDisplayName')}</label>
          <input
            type="text"
            value={displayName}
            onChange={e => onDisplayNameChange(e.target.value)}
            placeholder={t('forms.linkDisplayName')}
            className={cn(
              'w-full h-9 px-3 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20',
              displayNameError ? 'border-destructive' : 'border-border'
            )}
            aria-label={t('forms.linkDisplayName')}
            aria-invalid={!!displayNameError}
          />
          {displayNameError && <p className="text-xs text-destructive">{displayNameError}</p>}
        </div>
      </div>
    </div>
  );
}
