import { Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type ActivityButtonProps = {
  onClick: () => void;
  className?: string;
};

/** Opens the recent-activity dialog. The consumer renders it only for signed-in viewers. */
export function ActivityButton({ onClick, className }: ActivityButtonProps) {
  const { t } = useTranslation('crd-space');

  return (
    <Button variant="outline" className={cn('w-full uppercase gap-2 font-medium px-2', className)} onClick={onClick}>
      <Activity className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="truncate text-body-emphasis">{t('sidebar.recentActivity')}</span>
    </Button>
  );
}
