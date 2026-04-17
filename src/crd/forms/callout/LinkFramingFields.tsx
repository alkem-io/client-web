import { Link as LinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

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
        <span className="text-body-emphasis">{t('callout.link')}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="link-framing-url" className="text-caption text-muted-foreground">
            {t('forms.linkUrl')}
          </label>
          <input
            id="link-framing-url"
            type="url"
            value={url}
            onChange={e => onUrlChange(e.target.value)}
            placeholder={t('forms.linkUrlPlaceholder')}
            className={cn(
              'w-full h-9 px-3 border rounded-md bg-background text-control focus:outline-none focus:ring-2 focus:ring-primary/20',
              urlError ? 'border-destructive' : 'border-border'
            )}
            aria-invalid={!!urlError}
          />
          {urlError && <p className="text-caption text-destructive">{urlError}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="link-framing-display-name" className="text-caption text-muted-foreground">
            {t('forms.linkDisplayName')}
          </label>
          <input
            id="link-framing-display-name"
            type="text"
            value={displayName}
            onChange={e => onDisplayNameChange(e.target.value)}
            placeholder={t('forms.linkDisplayName')}
            className={cn(
              'w-full h-9 px-3 border rounded-md bg-background text-control focus:outline-none focus:ring-2 focus:ring-primary/20',
              displayNameError ? 'border-destructive' : 'border-border'
            )}
            aria-invalid={!!displayNameError}
          />
          {displayNameError && <p className="text-caption text-destructive">{displayNameError}</p>}
        </div>
      </div>
    </div>
  );
}
