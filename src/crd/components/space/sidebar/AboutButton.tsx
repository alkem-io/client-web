import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type AboutButtonProps = {
  onClick: () => void;
  className?: string;
};

/** Opens the read-only "About this Space" dialog. */
export function AboutButton({ onClick, className }: AboutButtonProps) {
  const { t } = useTranslation('crd-space');

  return (
    <Button variant="outline" className={cn('w-full uppercase gap-2 font-medium px-2', className)} onClick={onClick}>
      <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="truncate text-body-emphasis">{t('sidebar.aboutSpace')}</span>
    </Button>
  );
}
