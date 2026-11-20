import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type CommunityButtonProps = {
  onClick: () => void;
  className?: string;
};

/** Opens the community (members) dialog. */
export function CommunityButton({ onClick, className }: CommunityButtonProps) {
  const { t } = useTranslation('crd-space');

  return (
    <Button variant="outline" className={cn('w-full uppercase gap-2 font-medium px-2', className)} onClick={onClick}>
      <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="truncate text-body-emphasis">{t('sidebar.community')}</span>
    </Button>
  );
}
