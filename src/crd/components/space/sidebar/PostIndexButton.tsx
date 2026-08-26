import { List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type PostIndexButtonProps = {
  onClick: () => void;
  className?: string;
};

/** Opens the full Post Index dialog — the heavy list query fires only once open. */
export function PostIndexButton({ onClick, className }: PostIndexButtonProps) {
  const { t } = useTranslation('crd-space');

  return (
    <Button variant="outline" className={cn('w-full uppercase gap-2 font-medium px-2', className)} onClick={onClick}>
      <List className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="truncate text-body-emphasis">{t('sidebar.postIndex')}</span>
    </Button>
  );
}
