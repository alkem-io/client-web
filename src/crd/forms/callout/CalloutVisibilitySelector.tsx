import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

type Visibility = 'draft' | 'published';

type CalloutVisibilitySelectorProps = {
  value: Visibility;
  onChange: (value: Visibility) => void;
  notifyMembers?: boolean;
  onNotifyMembersChange?: (notify: boolean) => void;
  className?: string;
};

export function CalloutVisibilitySelector({
  value,
  onChange,
  notifyMembers,
  onNotifyMembersChange,
  className,
}: CalloutVisibilitySelectorProps) {
  const { t } = useTranslation('crd-space');

  return (
    <div className={cn('space-y-3', className)}>
      <span className="text-sm font-medium">{t('forms.visibility')}</span>
      <div className="flex gap-2">
        {(['draft', 'published'] as const).map(vis => (
          <button
            key={vis}
            type="button"
            className={cn(
              'px-4 py-2 rounded-md border text-sm font-medium transition-all',
              value === vis
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-muted border-border'
            )}
            onClick={() => onChange(vis)}
          >
            {vis === 'draft' ? t('forms.draftLabel') : t('forms.publishedLabel')}
          </button>
        ))}
      </div>

      {value === 'published' && onNotifyMembersChange && (
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={notifyMembers}
            onChange={e => onNotifyMembersChange(e.target.checked)}
            className="rounded border-border"
          />
          {t('forms.notifyMembers')}
        </label>
      )}
    </div>
  );
}
