import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type CampaignBannerProps = {
  onAction: () => void;
  className?: string;
};

export function CampaignBanner({ onAction, className }: CampaignBannerProps) {
  const { t } = useTranslation('crd-dashboard');

  return (
    <aside aria-label={t('campaign.title')} className={cn('rounded-lg border border-border bg-card p-4', className)}>
      <p className="font-semibold">{t('campaign.title')}</p>
      <p className="text-body text-muted-foreground mt-1">{t('campaign.description')}</p>
      <Button onClick={onAction} className="mt-3">
        {t('campaign.cta')}
      </Button>
    </aside>
  );
}
