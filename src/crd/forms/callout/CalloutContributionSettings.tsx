import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Switch } from '@/crd/primitives/switch';

type ContributionType = 'post' | 'memo' | 'whiteboard' | 'link';

type CalloutContributionSettingsProps = {
  allowedTypes: ContributionType[];
  onAllowedTypesChange: (types: ContributionType[]) => void;
  commentsEnabled: boolean;
  onCommentsEnabledChange: (enabled: boolean) => void;
  className?: string;
};

const CONTRIBUTION_TYPES: ContributionType[] = ['post', 'memo', 'whiteboard', 'link'];

export function CalloutContributionSettings({
  allowedTypes,
  onAllowedTypesChange,
  commentsEnabled,
  onCommentsEnabledChange,
  className,
}: CalloutContributionSettingsProps) {
  const { t } = useTranslation('crd-space');

  const toggleType = (type: ContributionType) => {
    if (allowedTypes.includes(type)) {
      onAllowedTypesChange(allowedTypes.filter(t => t !== type));
    } else {
      onAllowedTypesChange([...allowedTypes, type]);
    }
  };

  const typeLabels: Record<ContributionType, string> = {
    post: 'callout.post',
    memo: 'callout.memo',
    whiteboard: 'callout.whiteboard',
    link: 'callout.link',
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Allowed contribution types */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('forms.contributionTypes')}</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CONTRIBUTION_TYPES.map(type => (
            <button
              key={type}
              type="button"
              className={cn(
                'px-3 py-2 rounded-md border text-xs font-medium capitalize transition-all',
                allowedTypes.includes(type)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-muted border-border'
              )}
              onClick={() => toggleType(type)}
            >
              {t(typeLabels[type] as 'callout.post')}
            </button>
          ))}
        </div>
      </div>

      {/* Comments toggle */}
      <div className="flex items-center justify-between py-2">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">{t('forms.commentsEnabled')}</label>
        </div>
        <Switch checked={commentsEnabled} onCheckedChange={onCommentsEnabledChange} />
      </div>
    </div>
  );
}
